// supabase/functions/_shared/cors.ts

const PROD_ORIGIN = Deno.env.get('SITE_URL') || 'https://kotp-website.vercel.app'
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']

export const getCorsHeaders = (origin: string | null) => {
  const allowed = origin && (origin === PROD_ORIGIN || DEV_ORIGINS.includes(origin)) ? origin : PROD_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}