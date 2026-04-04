import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14?target=denonext"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_TOURNAMENT")

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

    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any

      const registrationId = session.metadata?.registration_id
      const teamName = session.metadata?.team_name
      const tournamentId = session.metadata?.tournament_id

      if (registrationId && teamName && tournamentId) {
        // 1. Mark registration as completed in 'tournament_registrations' (legacy hook)
        const { error: updateErrorTR } = await supabaseAdmin
          .from("tournament_registrations")
          .update({ payment_status: "completed" })
          .eq("id", registrationId)

        // 1b. Mark registration as 'paid' in 'registrations' (active standard hook)
        const { error: updateErrorReg } = await supabaseAdmin
          .from("registrations")
          .update({ payment_status: "paid" })
          .eq("id", registrationId)

        if (updateErrorTR && updateErrorReg) {
          console.error("Error updating registration:", updateErrorTR, updateErrorReg)
        }

        // 2. Insert into the teams table so it appears in Live Scores
        // Using "onConflict" or checking first isn't strictly necessary for a new registration, 
        // but we'll just insert straight away as there's no unique constraint on (name, tournament_id) explicitly known.
        const { error: teamError } = await supabaseAdmin
          .from("teams")
          .insert([
            {
              name: teamName,
              tournament_id: Number(tournamentId),
            }
          ])

        if (teamError) {
          console.error("Error inserting team for Live Scores:", teamError)
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
