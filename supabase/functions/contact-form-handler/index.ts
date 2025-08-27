// FINAL CLEANED-UP CODE: supabase/functions/contact-form-handler/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@3.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const payload = await req.json()
    const { name, email, subject, message } = payload

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'kotp.football@gmail.com',
      subject: `New KOTP Contact Form Submission: ${subject}`,
      html: `<p>New message from ${name} (${email}).</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p>`
    });

    if (error) {
      console.error({ resendError: error }); // Still log the error on the server
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error({ criticalError: e }); // Still log critical errors
    return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})