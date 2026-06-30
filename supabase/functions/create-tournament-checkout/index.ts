import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { getCorsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

// Tournaments that require the Champion/Challenger team_type field
const TEAM_TYPE_TOURNAMENTS = [
  'KOTP and Ultimate Soccer Present: Champions vs Challengers'
]

// Tournaments where the cancel URL has a custom path
const CANCEL_URL_MAP: Record<string, string> = {
  'KOTP and Ultimate Soccer Present: Champions vs Challengers': '/champions-vs-challengers-registration',
  'KOTP Youth Invitational': '/youth-invitational-registration',
}

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
      tournamentId, teamName, players, medicalInfo,
      agreeTerms, signature, signatureDate, teamType, division
    } = registrationData

    // --- Server-side validation ---
    if (!tournamentId) throw new Error('Tournament ID is missing.')
    if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 2)
      throw new Error('Invalid team name.')
    if (!agreeTerms) throw new Error('Terms must be agreed to.')
    if (!signature || typeof signature !== 'string' || signature.trim().length < 2)
      throw new Error('Signature is required.')

    // Fetch tournament to get entry fee AND player count limits
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .select('name, entry_fee, min_players, max_players')
      .eq('id', tournamentId)
      .single()

    if (tournamentError || !tournament) throw new Error('Tournament not found.')

    // Validate teamType only for tournaments that require it
    if (TEAM_TYPE_TOURNAMENTS.includes(tournament.name)) {
      if (!teamType || !['Champion', 'Challenger'].includes(teamType)) {
        throw new Error('You must select either Champion or Challenger.')
      }
    }

    // Validate division for tournaments that use it
    const validDivisions = ['U12-14 7 Aside', 'U9-11s 5 Aside']
    if (division && !validDivisions.includes(division)) {
      throw new Error('Invalid division selected.')
    }

    // Use dynamic player limits from the tournament record.
    // For Youth Invitational, override min based on division
    let minPlayers = tournament.min_players ?? 7
    const maxPlayers = tournament.max_players ?? 10

    if (division === 'U12-14 7 Aside') {
      minPlayers = 7
    } else if (division === 'U9-11s 5 Aside') {
      minPlayers = 5
    }

    if (!players || !Array.isArray(players) || players.length < minPlayers || players.length > maxPlayers) {
      throw new Error(`You must register between ${minPlayers} and ${maxPlayers} players.`)
    }

    let captainCount = 0;
    let captainEmail = '';
    let captainName = '';

    for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (!p.firstName || typeof p.firstName !== 'string' || p.firstName.trim().length < 1) {
            throw new Error(`Player ${i + 1} is missing a first name.`)
        }
        if (!p.lastName || typeof p.lastName !== 'string' || p.lastName.trim().length < 1) {
            throw new Error(`Player ${i + 1} is missing a last name.`)
        }

        if (p.isCaptain) {
            captainCount++;
            if (!p.email || typeof p.email !== 'string' || !p.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error('Captain must have a valid email address.')
            }
            if (!p.phone || typeof p.phone !== 'string' || p.phone.trim().length < 8) {
                throw new Error('Captain must have a valid phone number.')
            }
            // Instagram is optional — no validation required
            captainEmail = p.email.trim();
            captainName = `${p.firstName.trim()} ${p.lastName.trim()}`;
        }
    }

    if (captainCount !== 1) {
        throw new Error('Exactly one player must be selected as the team captain.')
    }

    const priceInCents = Math.round((tournament.entry_fee || 800) * 100)

    // 1. Insert into Supabase as "pending"
    const insertData: Record<string, any> = {
      tournament_id: tournamentId,
      team_name: teamName.trim(),
      players: players, // jsonb
      medical_info: medicalInfo || null,
      agreed_to_terms: agreeTerms,
      signature: signature.trim(),
      signature_date: signatureDate,
      payment_status: 'pending'
    }

    // Only include optional fields if they have values
    if (teamType) insertData.team_type = teamType
    if (division) insertData.division = division

    const { data: record, error: dbError } = await supabaseAdmin
      .from('tournament_registrations')
      .insert([insertData])
      .select('id')
      .single()

    if (dbError) throw dbError

    // Build description including division if present
    const descParts = [`Team: ${teamName.trim()} — Captain: ${captainName}`]
    if (division) descParts.push(`Division: ${division}`)

    // Determine cancel URL
    const cancelPath = CANCEL_URL_MAP[tournament.name] || '/tournament-registration'

    // 2. Create Stripe Checkout session with explicit AUD price_data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: captainEmail,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `Tournament Registration: ${tournament.name}`,
              description: descParts.join(' | '),
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${origin}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}?status=cancelled`,
      metadata: {
        registration_id: record.id,
        team_name: teamName.trim(),
        captain_email: captainEmail,
        tournament_id: String(tournamentId)
      },
    })

    // 3. Store Stripe session ID in DB
    await supabaseAdmin
      .from('tournament_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', record.id)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in create-tournament-checkout:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
