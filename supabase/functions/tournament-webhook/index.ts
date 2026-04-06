import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14?target=denonext"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_TOURNAMENT")
const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SERVICE_ROLE_KEY") ?? ""
  )

  try {
    const body = await req.text()
    if (!endpointSecret) {
      throw new Error("Webhook secret not configured")
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret, undefined, cryptoProvider)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any
      const registrationId = session.metadata?.registration_id
      const teamName = session.metadata?.team_name
      const tournamentId = session.metadata?.tournament_id

      if (registrationId) {
        console.log(`Processing paid tournament registration: ${registrationId}`)

        // Update payment status to 'paid' in tournament_registrations
        const { error: updateError } = await supabaseAdmin
          .from("tournament_registrations")
          .update({
            payment_status: "paid",
            stripe_session_id: session.id,
          })
          .eq("id", registrationId)

        if (updateError) {
          console.error("Error updating tournament registration:", updateError)
          throw updateError
        }

        // Insert into teams table for Live Scores (if team name and tournament are present)
        if (teamName && tournamentId) {
          const { error: teamError } = await supabaseAdmin
            .from("teams")
            .insert([{ name: teamName, tournament_id: Number(tournamentId) }])

          if (teamError) {
            // Non-fatal: log but don't crash the webhook
            console.error("Error inserting team for Live Scores:", teamError)
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    console.error("Webhook error:", err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
