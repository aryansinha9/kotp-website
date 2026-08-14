import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'stripe'
import { getCorsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

// ── Off-season Summer Program Stripe configuration ───────────────────────────
// Fridays 6:30pm - 7:30pm at Morgan Power Reserve — $22 per week.
// Unlike the Parklea trial (a hardcoded Payment Link, which cannot carry the
// registration id back), both packages here go through Checkout Sessions so the
// webhook always receives metadata.registration_id and reconciles on its own.
const OFFSEASON_PRODUCT_ID = 'prod_V4N8TtlKYVK0XC'
const OFFSEASON_TRIAL_PRODUCT_ID = 'prod_V4NQ04NvxexyG4'
const OFFSEASON_WEEKLY_PRICE_IN_CENTS = 2200
const OFFSEASON_TRIAL_PRICE_IN_CENTS = 2200

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))
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

    const validTeams = ["8A", "8B", "8C", "8D", "8E", "8F", "9A", "9B", "9C", "9D", "10A", "10B", "10C", "11A", "11B", "11C", "12A", "12B", "12C", "13A", "13B", "14A", "14B", "U15S", "16A", "16B", "10G", "12GA", "12GB", "14G"]
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
      .from('offseason_registrations')
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

    // 2. Create the Stripe Checkout session.
    // The trial is a one-off charge against its own product; the standard
    // package is a weekly recurring subscription.
    const isTrial = packageType === 'trial'

    const priceData: any = {
      currency: 'aud',
      product: isTrial ? OFFSEASON_TRIAL_PRODUCT_ID : OFFSEASON_PRODUCT_ID,
      unit_amount: isTrial ? OFFSEASON_TRIAL_PRICE_IN_CENTS : OFFSEASON_WEEKLY_PRICE_IN_CENTS,
    }
    if (!isTrial) priceData.recurring = { interval: 'week' }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: parentEmail,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: isTrial ? 'payment' : 'subscription',
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/academy/off-season-summer?status=cancelled`,
      metadata: {
        registration_id: record.id,
        participant_name: participantName,
        parent_email: parentEmail,
        package_type: packageType || 'standard'
      },
    })

    const sessionUrl = session.url;

    // 3. Optional: Store the stripe session ID in the database back here, but usually metadata is sufficient
    await supabaseAdmin
      .from('offseason_registrations')
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
