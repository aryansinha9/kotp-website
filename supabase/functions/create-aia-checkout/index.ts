import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { corsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')


serve(async (req: Request) => {
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
      playerFirstName, playerLastName, playerBirthDate, yearGroup,
      parentFirstName, parentLastName, phoneNumber, parentEmail,
      streetAddress, streetAddress2, city, state, postalCode,
      allergies, inhaler,
      agreeTerms, signature, signatureDate,
      howDidYouHear, interestedPrograms,
      referralFirstName, referralLastName,
    } = registrationData

    // --- Server-side validation ---
    if (!playerFirstName || typeof playerFirstName !== 'string' || playerFirstName.trim().length < 2)
      throw new Error('Invalid player first name.')
    if (!playerLastName || typeof playerLastName !== 'string' || playerLastName.trim().length < 2)
      throw new Error('Invalid player last name.')
    if (!parentEmail || typeof parentEmail !== 'string' || !parentEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      throw new Error('Invalid email format.')
    if (!parentFirstName || typeof parentFirstName !== 'string' || parentFirstName.trim().length < 2)
      throw new Error('Invalid parent first name.')
    if (!parentLastName || typeof parentLastName !== 'string' || parentLastName.trim().length < 2)
      throw new Error('Invalid parent last name.')
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8)
      throw new Error('Invalid phone number.')
    if (!streetAddress || typeof streetAddress !== 'string' || streetAddress.trim().length < 5)
      throw new Error('Invalid street address.')
    if (!city || typeof city !== 'string' || city.trim().length < 2)
      throw new Error('Invalid city.')
    if (!state || typeof state !== 'string' || state.trim().length < 2)
      throw new Error('Invalid state.')
    if (!postalCode || typeof postalCode !== 'string' || postalCode.trim().length < 4)
      throw new Error('Invalid postal code.')
    if (!agreeTerms)
      throw new Error('Terms must be agreed to.')
    if (!signature || typeof signature !== 'string' || signature.trim().length < 2)
      throw new Error('Signature is required.')

    const validYearGroups = [
      'kindergarten', 'year-1', 'year-2', 'year-3', 'year-4', 'year-5',
      'year-6', 'year-7', 'year-8', 'year-9', 'year-10'
    ]
    if (!validYearGroups.includes(yearGroup))
      throw new Error('Invalid year group selected.')

    // 1. Insert into Supabase as "pending_payment"
    const { data: record, error: dbError } = await supabaseAdmin
      .from('aia_program_registrations')
      .insert([{
        participant_first_name: playerFirstName.trim(),
        participant_last_name: playerLastName.trim(),
        dob: playerBirthDate,
        year_group: yearGroup,
        parent_first_name: parentFirstName.trim(),
        parent_last_name: parentLastName.trim(),
        parent_phone: phoneNumber.trim(),
        parent_email: parentEmail.trim(),
        street_address: streetAddress.trim(),
        street_address2: streetAddress2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        allergies: allergies || '',
        inhaler: inhaler || '',
        agreed_to_terms: agreeTerms,
        signature: signature.trim(),
        signature_date: signatureDate,
        payment_status: 'pending_payment',
        how_did_you_hear: howDidYouHear || null,
        interested_programs: interestedPrograms || null,
        referral_first_name: referralFirstName?.trim() || null,
        referral_last_name: referralLastName?.trim() || null,
      }])
      .select('id')
      .single()

    if (dbError) throw dbError

    // 2. Create Stripe Checkout session — uses the pre-created Stripe price ($125 + GST)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: parentEmail.trim(),
      line_items: [
        {
          price: 'price_1TGDwXJTT6itmjMc7KLsQsq4',
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${origin}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/academy/aia-after-school?status=cancelled`,
      metadata: {
        registration_id: record.id,
        participant_name: `${playerFirstName.trim()} ${playerLastName.trim()}`,
        parent_email: parentEmail.trim(),
      },
    })

    // 3. Store Stripe session ID in DB
    await supabaseAdmin
      .from('aia_program_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', record.id)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in create-aia-checkout:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
