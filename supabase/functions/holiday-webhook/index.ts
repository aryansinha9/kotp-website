import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { sendConfirmationEmailSafely } from '../_shared/email.ts'

// Explicitly use the native Supabase keys for bypass, while supporting local vars
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET_HOLIDAY')
const SUPA_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || ''

const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  SUPA_KEY
)

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret or signature missing configuration.', { status: 400 })
  }

  const body = await req.text()
  let event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response('Webhook verification failed', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const registrationId = session.metadata?.registration_id
      const participantName = session.metadata?.participant_name
      const parentEmail = session.metadata?.parent_email

      if (registrationId) {
        console.log(`Processing successful checkout for holiday registration: ${registrationId}`)
        
        // 1. Mark current row as paid. The `neq` guard makes this idempotent:
        //    Stripe retries webhooks, and without it a retry would re-send the
        //    confirmation email to a parent who already has one.
        const { data: updatedRow, error } = await supabaseAdmin
          .from('holiday_program_registrations')
          .update({ 
            payment_status: 'paid',
            stripe_session_id: session.id
          })
          .eq('id', registrationId)
          .neq('payment_status', 'paid')
          .select()
          .maybeSingle()

        if (error) {
          console.error("Database error updating holiday program registration:", error)
          throw error
        }

        if (!updatedRow) {
          console.log(`Holiday registration ${registrationId} was already paid - skipping duplicate email.`)
        }

        // 2. Remove any other 'pending' duplicate cart entries for this exact participant & parent combo!
        if (participantName && parentEmail) {
            await supabaseAdmin
              .from('holiday_program_registrations')
              .delete()
              .eq('participant_name', participantName)
              .eq('parent_email', parentEmail)
              .neq('id', registrationId)
              .in('payment_status', ['pending', 'pending_payment']);
        }

        // 3. Confirmation email. Best-effort: never let this fail the webhook,
        //    or Stripe will retry a payment we have already recorded.
        if (updatedRow) {
          await sendConfirmationEmailSafely({
            to: updatedRow.parent_email,
            participantName: updatedRow.participant_name,
            programName: 'KOTP Holiday Program',
            details: [
              { label: 'Booking option', value: updatedRow.package_type },
              { label: 'Days booked', value: updatedRow.selected_days },
            ],
            amountTotalCents: session.amount_total,
          })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
