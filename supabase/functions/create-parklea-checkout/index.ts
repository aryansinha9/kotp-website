import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'stripe'
import { corsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Server configuration error: STRIPE_SECRET_KEY is missing.')
    }
    
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')
    if (!SERVICE_ROLE_KEY) {
      throw new Error('Server configuration error: SERVICE_ROLE_KEY is missing.')
    }

    const stripe = Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SERVICE_ROLE_KEY
    )

    const registrationData = await req.json()
    const { 
      participantName, ageTurning2026, dob, position, team,
      parentName, parentPhone, parentEmail, emergencyContact, homeAddress,
      jerseySize, shortsSize, socksSize,
      hasMedicalCondition, medicalDescription, hasMedication, medicationDetails,
      agreedToTerms, signature, signatureDate, packageType
    } = registrationData

    // --- Server-side input validation ---
    if (!participantName || typeof participantName !== 'string' || participantName.trim().length < 2) 
      throw new Error("Invalid participant name.")
    if (!parentEmail || typeof parentEmail !== 'string' || !parentEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) 
      throw new Error("Invalid email format.")
    if (!parentName || typeof parentName !== 'string' || parentName.trim().length < 2) 
      throw new Error("Invalid parent name.")
    
    const ageNum = parseInt(ageTurning2026, 10)
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 25) 
      throw new Error("Invalid age.")

    const validTeams = ["8A", "8B", "8C", "8D", "8E", "8F", "9B", "9C", "9D", "10A", "10B", "10C", "11A", "11B", "11C", "12A", "12B", "12C", "13A", "13B", "14A", "14B", "U15S", "16A", "16B", "10G", "12GA", "12GB", "14G"]
    if (!validTeams.includes(team)) throw new Error("Invalid team selected.")

    const validSizes = ["4Y", "6Y", "8Y", "10Y", "12Y", "14Y", "16Y"]
    if (!validSizes.includes(jerseySize)) throw new Error("Invalid jersey size.")
    if (!validSizes.includes(shortsSize)) throw new Error("Invalid shorts size.")
    if (socksSize !== "One Size Fits All") throw new Error("Invalid socks size.")

    if (!parentPhone || typeof parentPhone !== 'string' || parentPhone.trim().length < 8) 
      throw new Error("Invalid phone number.")
    if (!homeAddress || typeof homeAddress !== 'string' || homeAddress.trim().length < 5) 
      throw new Error("Invalid home address.")
    if (!agreedToTerms) 
      throw new Error("Terms must be agreed to.")
    if (!signature || typeof signature !== 'string' || signature.trim().length < 2) 
      throw new Error("Signature is required.")

    // 1. Insert into Supabase as "pending"
    const { data: record, error: dbError } = await supabaseAdmin
      .from('parklea_registrations')
      .insert([{
        participant_name: participantName,
        age_turning_2026: parseInt(ageTurning2026, 10),
        dob,
        team,
        position,
        parent_name: parentName,
        parent_phone: parentPhone,
        parent_email: parentEmail,
        emergency_contact: emergencyContact,
        home_address: homeAddress,
        jersey_size: jerseySize,
        shorts_size: shortsSize,
        socks_size: socksSize,
        has_medical_condition: hasMedicalCondition,
        medical_description: medicalDescription,
        has_medication: hasMedication,
        medication_details: medicationDetails,
        agreed_to_terms: agreedToTerms,
        signature,
        signature_date: signatureDate,
        payment_status: 'pending', // Default state
        package_type: packageType || 'standard'
      }])
      .select('id')
      .single()

    if (dbError) throw dbError

    let sessionUrl = '';

    if (packageType === 'trial') {
      // Return the hardcoded Stripe payment link for trials with client_reference_id
      sessionUrl = `https://buy.stripe.com/14AeVefcN1Dmg3Pcc8enS01?prefilled_email=${encodeURIComponent(parentEmail)}&client_reference_id=${record.id}`;
      
      // Still want to link this back to the registration if possible, but payment links handles it differently.
      // We will just update status to pending and the webhook will need to somehow match the email or we rely on manual reconciliation for now.
    } else {
      const priceInCents = 1650 
      const priceData: any = {
        currency: 'aud',
        product: 'prod_U5hSL9gqZ7F3TV',
        unit_amount: priceInCents,
        recurring: { interval: 'week' }
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
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: `${SITE_URL}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/academy/parklea?status=cancelled`,
        metadata: {
          registration_id: record.id,
          participant_name: participantName,
          parent_email: parentEmail,
          package_type: packageType || 'standard'
        },
      })

      sessionUrl = session.url;

      // 3. Optional: Store the stripe session ID in the database back here, but usually metadata is sufficient
      await supabaseAdmin
        .from('parklea_registrations')
        .update({ stripe_session_id: session.id })
        .eq('id', record.id)
    }

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
