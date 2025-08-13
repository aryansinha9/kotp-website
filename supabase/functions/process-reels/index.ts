// FINAL, DEFINITIVE CODE: supabase/functions/process-reels/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }

  try {
    const supabaseAdmin = createClient( Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' );
    const META_CLIENT_TOKEN = Deno.env.get('META_CLIENT_TOKEN');
    if (!META_CLIENT_TOKEN) throw new Error("META_CLIENT_TOKEN is not set.");
    
    const { data: reelsToProcess, error: selectError } = await supabaseAdmin
      .from('featured_reels').select('id, instagram_url').is('embed_html', null);

    if (selectError) throw selectError;
    if (reelsToProcess.length === 0) {
      return new Response(JSON.stringify({ message: "No new reels to process." }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    for (const reel of reelsToProcess) {
      // --- THIS IS THE CRITICAL FIX ---
      // 1. Clean the URL to remove tracking parameters
      const cleanUrl = reel.instagram_url.split('?')[0];

      // 2. Use the clean URL in the API call
      const oEmbedUrl = `https://graph.facebook.com/v19.0/oembed_post?url=${cleanUrl}&access_token=${META_CLIENT_TOKEN}`;
      // -----------------------------
      
      const response = await fetch(oEmbedUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch oEmbed for ${cleanUrl}:`, errorText);
        continue;
      }
      
      const oEmbedData = await response.json();
      const embedHtml = oEmbedData.html;
      if (!embedHtml) {
        console.error(`No HTML in response for ${cleanUrl}`);
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from('featured_reels').update({ embed_html: embedHtml }).eq('id', reel.id);

      if (updateError) console.error(`Failed to update reel ${reel.id}:`, updateError);
    }

    return new Response(JSON.stringify({ message: `Successfully processed ${reelsToProcess.length} reels.` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})