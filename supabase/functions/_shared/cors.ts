// supabase/functions/_shared/cors.ts
const SITE_URL = Deno.env.get('SITE_URL') || 'https://kotp-website.vercel.app'

export const corsHeaders = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}