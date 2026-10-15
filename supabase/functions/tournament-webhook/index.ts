import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14?target=denonext"
import { sendConfirmationEmailSafely } from '../_shared/email.ts'

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

        // Update payment status to 'paid' in tournament_registrations.
        // The `neq` guard makes this idempotent - Stripe retries webhooks, and
        // a retry must not re-send the confirmation email.
        const { data: updatedRow, error: updateError } = await supabaseAdmin
          .from("tournament_registrations")
          .update({
            payment_status: "paid",
            stripe_session_id: session.id,
          })
          .eq("id", registrationId)
          .neq("payment_status", "paid")
          .select("*, tournaments ( name )")
          .maybeSingle()

        if (updateError) {
          console.error("Error updating tournament registration:", updateError)
          throw updateError
        }

        if (!updatedRow) {
          console.log(`Tournament registration ${registrationId} was already paid - skipping duplicate email.`)
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

        // Confirmation email to the team captain. There is no contact column on
        // this table - the captain's address lives inside the players JSON.
        if (updatedRow) {
          const players = Array.isArray(updatedRow.players) ? updatedRow.players : []
          const captain = players.find((p: any) => p?.isCaptain && p?.email) || players.find((p: any) => p?.email)
          if (captain?.email) {
            await sendConfirmationEmailSafely({
              to: captain.email,
              participantName: updatedRow.team_name,
              programName: updatedRow.tournaments?.name || "KOTP Tournament",
              details: [
                { label: "Team", value: updatedRow.team_name },
                { label: "Division", value: updatedRow.division },
                { label: "Squad size", value: players.length ? `${players.length} players` : "" },
              ],
              amountTotalCents: session.amount_total,
            })
          } else {
            console.error(`Tournament registration ${registrationId} has no captain email - no confirmation sent.`)
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
