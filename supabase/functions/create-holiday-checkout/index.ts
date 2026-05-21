import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { getCorsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'https://kotp-website.vercel.app'

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Server configuration error: STRIPE_SECRET_KEY is missing.')
    }
    
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')
    if (!SERVICE_ROLE_KEY) {
      throw new Error('Server configuration error: SERVICE_ROLE_KEY is missing.')
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SERVICE_ROLE_KEY
    )

    const registrationData = await req.json()
    const { 
      participantName, ageTurning2026, dob, position,
      parentName, parentPhone, parentEmail, emergencyContact, homeAddress,
      hasMedicalCondition, medicalDescription, hasMedication, medicationDetails,
      agreedToTerms, signature, signatureDate, selectedDays
    } = registrationData

    // --- Server-side input validation ---
    if (!participantName || typeof participantName !== 'string' || participantName.trim().length < 2) 
      throw new Error("Invalid participant name.")
    if (!parentEmail || typeof parentEmail !== 'string' || !parentEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) 
      throw new Error("Invalid email format.")
    if (!parentName || typeof parentName !== 'string' || parentName.trim().length < 2) 
      throw new Error("Invalid parent name.")
    
    const ageNum = parseInt(ageTurning2026, 10)
    if (isNaN(ageNum)) 
      throw new Error("Invalid age.")

    if (!parentPhone || typeof parentPhone !== 'string' || parentPhone.trim().length < 8) 
      throw new Error("Invalid phone number.")
    if (!homeAddress || typeof homeAddress !== 'string' || homeAddress.trim().length < 5) 
      throw new Error("Invalid home address.")
    if (!agreedToTerms) 
      throw new Error("Terms must be agreed to.")
    if (!signature || typeof signature !== 'string' || signature.trim().length < 2) 
      throw new Error("Signature is required.")

    const validOfferings = [
        "Mon 6 Jul", "Tue 7 Jul", "Wed 8 Jul", "Thu 9 Jul", "Fri 10 Jul",
        "Mon 13 Jul", "Tue 14 Jul", "Wed 15 Jul", "Thu 16 Jul", "Fri 17 Jul"
    ];

    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
      throw new Error("Please select at least one day for the holiday program.")
    }
    
    for (const day of selectedDays) {
        if (!validOfferings.includes(day)) {
            throw new Error(`Invalid day selected: ${day}`);
        }
    }

    // Server side price calculation
    const dayCount = selectedDays.length;
    let backendTotal = dayCount * 35;
    let computedPackageType = "Single Days";
    
    if (dayCount === 5) {
        backendTotal = 150;
        computedPackageType = "1 Week Package (5 Days)";
    } else if (dayCount > 5 && dayCount < 10) {
        backendTotal = 150 + ((dayCount - 5) * 35);
        computedPackageType = "1 Week + Extra Days";
    } else if (dayCount === 10) {
        backendTotal = 280;
        computedPackageType = "2 Week Package (10 Days)";
    }

    // 1. Insert into Supabase as "pending_payment"
    const { data: record, error: dbError } = await supabaseAdmin
      .from('holiday_program_registrations')
      .insert([{
        participant_name: participantName,
        age_turning_2026: parseInt(ageTurning2026, 10),
        dob,
        position,
        parent_name: parentName,
        parent_phone: parentPhone,
        parent_email: parentEmail,
        emergency_contact: emergencyContact,
        home_address: homeAddress,
        has_medical_condition: hasMedicalCondition,
        medical_description: medicalDescription,
        has_medication: hasMedication,
        medication_details: medicationDetails,
        agreed_to_terms: agreedToTerms,
        signature,
        signature_date: signatureDate,
        payment_status: 'pending_payment',
        package_type: computedPackageType,
        total_amount: backendTotal,
        selected_days: selectedDays.join(', ')
      }])
      .select('id')
      .single()

    if (dbError) throw dbError

    // 2. Stripe integration
    const priceData: any = {
      currency: 'aud',
      product: 'prod_UBHor9QgnXE56R',
      unit_amount: backendTotal * 100, // Stripe uses cents
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: parentEmail,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${origin}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/holiday-program?status=cancelled`,
      metadata: {
        registration_id: record.id,
        participant_name: participantName,
        parent_email: parentEmail,
        package_type: computedPackageType,
        total_amount: backendTotal
      },
    })

    const sessionUrl = session.url;

    await supabaseAdmin
      .from('holiday_program_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', record.id)

    return new Response(JSON.stringify({ url: sessionUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in function execution:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
