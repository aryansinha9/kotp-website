import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
// Note: User will need to configure this new secret after adding the webhook
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET_PARKLEA')

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
    return new Response('Webhook secret or signature missing configuration. Ensure STRIPE_WEBHOOK_SECRET_PARKLEA is set.', { status: 400 })
  }

  const body = await req.text()
  let event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const registrationId = session.metadata?.registration_id

      if (registrationId) {
        console.log(`Processing successful checkout for parklea registration: ${registrationId}`)
        
        const { error } = await supabaseAdmin
          .from('parklea_registrations')
          .update({ 
            payment_status: 'successful',
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer
          })
          .eq('id', registrationId)

        if (error) {
          console.error("Database error updating parklea registration:", error)
          throw error
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
