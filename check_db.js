const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gjeepzarenavlrnpvyee.supabase.co';
const supabaseKey = process.env.SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZWVwemFyZW5hdmxybnB2eWVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNTAzNiwiZXhwIjoyMDcwNDkxMDM2fQ.XXaQsmoVKmj04qcKA_zqB7rYbvHJ4M5gGzYajcU7Om8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('parklea_registrations')
    .select('participant_name, parent_email, payment_status, package_type, stripe_session_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log("Database response:", JSON.stringify(data, null, 2));
}
check();
