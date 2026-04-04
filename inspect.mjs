import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase.rpc('get_column_types', {})
  // If rpc doesn't exist, we can just do a select from information_schema
  // but supabase-js can't select from information_schema easily natively via data API.
  
  // Let's just fetch exactly 1 row from registrations and output it
  const { data: reg, error: regErr } = await supabase
    .from('registrations')
    .select('*')
    .limit(1)

  console.log("Registrations sample:", reg)
}

run()
