// PASTE THIS ENTIRE CODE BLOCK INTO: supabase/functions/create-stripe-checkout/index.ts

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
    
    // --- THIS IS THE ONLY LINE THAT HAS CHANGED ---
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
    const { tournamentId, teamName, contactPerson, email, phone, ageGroup } = registrationData

    if (!tournamentId) throw new Error("Tournament ID is required.")

    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .select('name, entry_fee')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw tournamentError
    if (!tournament) throw new Error('Tournament not found.')
    if (tournament.entry_fee <= 0) {
      throw new Error('This tournament is free or has an invalid entry fee.')
    }

    const priceInCents = Math.round(tournament.entry_fee * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Registration: ${tournament.name}`,
              description: `Team: ${teamName}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${SITE_URL}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/register/${tournamentId}?status=cancelled`,
      metadata: {
        tournament_id: tournamentId,
        team_name: teamName,
        contact_person: contactPerson,
        email: email,
        phone: phone,
        age_group: ageGroup || '',
        amount_paid: tournament.entry_fee.toString(),
      },
    })

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