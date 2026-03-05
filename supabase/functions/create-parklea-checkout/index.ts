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
      participantName, ageTurning2026, dob, position, 
      parentName, parentPhone, parentEmail, emergencyContact, homeAddress,
      jerseySize, hoodieSize, shortsSize, socksSize,
      hasMedicalCondition, medicalDescription, hasMedication, medicationDetails,
      agreedToTerms, signature, signatureDate
    } = registrationData

    if (!participantName || !parentEmail) throw new Error("Missing required registration fields.")

    // 1. Insert into Supabase as "pending"
    const { data: record, error: dbError } = await supabaseAdmin
      .from('parklea_registrations')
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
        jersey_size: jerseySize,
        hoodie_size: hoodieSize,
        shorts_size: shortsSize,
        socks_size: socksSize,
        has_medical_condition: hasMedicalCondition,
        medical_description: medicalDescription,
        has_medication: hasMedication,
        medication_details: medicationDetails,
        agreed_to_terms: agreedToTerms,
        signature,
        signature_date: signatureDate,
        payment_status: 'pending' // Default state
      }])
      .select('id')
      .single()

    if (dbError) throw dbError

    // 2. Create Stripe Checkout Session
    // $15 + 10% GST = $16.50 AUD
    const priceInCents = 1650 

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: parentEmail,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product: 'prod_U5hSL9gqZ7F3TV',
            unit_amount: priceInCents,
            recurring: {
              interval: 'week',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${SITE_URL}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/academy/parklea?status=cancelled`,
      metadata: {
        registration_id: record.id,
        participant_name: participantName,
        parent_email: parentEmail
      },
    })

    // 3. Optional: Store the stripe session ID in the database back here, but usually metadata is sufficient
    await supabaseAdmin
      .from('parklea_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', record.id)

    return new Response(JSON.stringify({ url: session.url }), {
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
