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
        "Mon 28 Sep", "Tue 29 Sep", "Wed 30 Sep", "Thu 1 Oct", "Fri 2 Oct", "Sat 3 Oct", "Sun 4 Oct",
        "Mon 5 Oct", "Tue 6 Oct", "Wed 7 Oct", "Thu 8 Oct", "Fri 9 Oct", "Sat 10 Oct", "Sun 11 Oct"
    ];

    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
      throw new Error("Please select at least one day for the holiday program.")
    }
    
    for (const day of selectedDays) {
        if (!validOfferings.includes(day)) {
            throw new Error(`Invalid day selected: ${day}`);
        }
    }

    // Server side price calculation (must mirror src/Pages/HolidayProgram.jsx)
    const DAY_RATE = 35;
    const holidayPackages = [
        { days: 5, price: 150, label: "1 Week Package (5 Days)", extraLabel: "1 Week + Extra Days" },
        { days: 10, price: 250, label: "2 Week Package (10 Days)", extraLabel: "2 Week + Extra Days" },
        { days: 14, price: 300, label: "Full Program Package (14 Days)", extraLabel: null }
    ];

    const dayCount = selectedDays.length;
    let backendTotal: number;
    let computedPackageType: string;

    const exactPackage = holidayPackages.find(p => p.days === dayCount);
    if (exactPackage) {
        backendTotal = exactPackage.price;
        computedPackageType = exactPackage.label;
    } else {
        const base = [...holidayPackages].reverse().find(p => p.days < dayCount);
        backendTotal = base ? base.price + ((dayCount - base.days) * DAY_RATE) : dayCount * DAY_RATE;
        computedPackageType = base?.extraLabel ?? "Single Days";

        // Never charge more than a larger package that already covers these days.
        const nextUp = holidayPackages.find(p => p.days > dayCount);
        if (nextUp && nextUp.price < backendTotal) backendTotal = nextUp.price;
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
