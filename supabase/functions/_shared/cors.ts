// supabase/functions/_shared/cors.ts

const allowedOrigin = Deno.env.get('SITE_URL') || 'https://kotp-website.vercel.app'

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}