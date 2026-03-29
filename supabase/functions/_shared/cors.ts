// supabase/functions/_shared/cors.ts

const ALLOWED_ORIGINS = [
  Deno.env.get('SITE_URL') || 'https://kotp-website.vercel.app',
  'https://www.kingofthepitch.com.au',
  'https://kingofthepitch.com.au',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
]

export const getCorsHeaders = (origin: string | null) => {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.kingofthepitch.com.au'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}