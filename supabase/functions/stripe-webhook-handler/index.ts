// supabase/functions/stripe-webhook-handler/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { Resend } from 'https://esm.sh/resend@3.2.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const resend = new Resend(RESEND_API_KEY)
const cryptoProvider = Stripe.createSubtleCryptoProvider()

console.log('Hello from MODERN Stripe Webhook Handler!')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature' } })
  }
  
  try {
    if (!SERVICE_ROLE_KEY || !STRIPE_WEBHOOK_SIGNING_SECRET || !RESEND_API_KEY) {
      throw new Error('Missing required environment variables.')
    }
    
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()

    if (!signature) {
      throw new Error('Missing Stripe-Signature header.')
    }

    const receivedEvent = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SIGNING_SECRET, undefined, cryptoProvider)
    console.log(`🔔 Stripe event received: ${receivedEvent.type}`)

    if (receivedEvent.type === 'checkout.session.completed') {
      const session = receivedEvent.data.object as Stripe.Checkout.Session
      const metadata = session.metadata

      if (!metadata || !metadata.registration_id) {
        throw new Error('Webhook received without necessary registration_id metadata.')
      }

      const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', SERVICE_ROLE_KEY)

      // Update the existing pending registration
      const { data: registrationData, error } = await supabaseAdmin
        .from('registrations')
        .update({
          payment_status: 'paid',
          stripe_session_id: session.id,
        })
        .eq('id', metadata.registration_id)
        .select(`*, tournaments ( name )`)
        .single()

      if (error) {
        console.error('Database update error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      console.log(`✅ Successfully updated registration for team: ${registrationData.team_name}`)

      const tournamentName = registrationData.tournaments?.name || 'the tournament';
      
      console.log(`Attempting to send confirmation email via Resend...`);

      const { data: emailData, error: emailError } = await resend.emails.send({
        // --- THIS IS THE ONLY CHANGE ---
        from: 'onboarding@resend.dev', // Use the Resend test address
        to: registrationData.email,
        subject: `Confirmation: You're Registered for ${tournamentName}!`,
        html: `<p>Hi ${registrationData.contact_person}, your team <strong>${registrationData.team_name}</strong> is registered for the <strong>${tournamentName}</strong>. Payment received.</p><p>This is a test email from a local development environment.</p>`,
      });

      if (emailError) {
        console.error("Resend API Error:", emailError);
      } else {
        console.log("Resend API Success Response:", emailData);
        console.log(`📧 Confirmation email sent to: ${metadata.email}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })

  } catch (err) {
    console.error(`Webhook handler error: ${err.message}`)
    return new Response('Webhook processing error', { status: 400 })
  }
})