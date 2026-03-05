// FINAL CLEANED-UP CODE: supabase/functions/contact-form-handler/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@3.2.0'

const SITE_URL = Deno.env.get('SITE_URL') || 'https://kotp-website.vercel.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sanitize user input to prevent HTML injection in emails
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const payload = await req.json()
    const { name, email, subject, message } = payload

    // Sanitize all user-provided fields before inserting into HTML
    const safeName = escapeHtml(name || '')
    const safeEmail = escapeHtml(email || '')
    const safeSubject = escapeHtml(subject || '')
    const safeMessage = escapeHtml(message || '')

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'kotp.football@gmail.com',
      subject: `New KOTP Contact Form Submission: ${safeSubject}`,
      html: `<p>New message from ${safeName} (${safeEmail}).</p><p><strong>Subject:</strong> ${safeSubject}</p><p><strong>Message:</strong></p><p>${safeMessage}</p>`
    });

    if (error) {
      console.error({ resendError: error });
      return new Response(JSON.stringify({ error: 'Failed to send message.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error({ criticalError: e });
    return new Response(JSON.stringify({ error: 'An internal error occurred.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})