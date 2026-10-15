import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'stripe'
import { sendConfirmationEmailSafely } from '../_shared/email.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
// Note: User will need to configure this new secret after adding the webhook
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET_OFFSEASON')

const stripe = Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SERVICE_ROLE_KEY') || ''
)

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret or signature missing configuration. Ensure STRIPE_WEBHOOK_SECRET_OFFSEASON is set.', { status: 400 })
  }

  const body = await req.text()
  let event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response('Webhook verification failed', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      // Trial payments use client_reference_id, standard subscriptions use metadata
      const registrationId = session.metadata?.registration_id || session.client_reference_id

      if (registrationId) {
        console.log(`Processing successful checkout for offseason registration: ${registrationId}`)

        // The `neq` guard below makes this idempotent - Stripe retries
        // webhooks, and a retry must not re-send the confirmation email.
        const { data: updatedRow, error } = await supabaseAdmin
          .from('offseason_registrations')
          .update({
            payment_status: 'successful',
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer
          })
          .eq('id', registrationId)
          .neq('payment_status', 'successful')
          .select()
          .maybeSingle()

        if (error) {
          console.error("Database error updating offseason registration:", error)
          throw error
        }

        // Confirmation email. Best-effort - must never fail the webhook.
        if (updatedRow) {
          const firstPayment = typeof session.amount_total === 'number'
            ? `$${(session.amount_total / 100).toFixed(2)} AUD`
            : ''
          await sendConfirmationEmailSafely({
            to: updatedRow.parent_email,
            participantName: updatedRow.participant_name,
            programName: 'Off-season Summer Program',
            details: [
              { label: 'Package', value: updatedRow.package_type },
              { label: 'First payment', value: firstPayment },
              { label: 'Billing', value: 'Recurring weekly until cancelled' },
            ],
          })
        } else {
          console.log(`offseason registration ${registrationId} was already successful - skipping duplicate email.`)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
