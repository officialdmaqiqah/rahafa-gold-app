const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function resetDailyPrices() {
  console.log("=== Inspecting & Resetting Daily Prices ===");

  const { data: prices, error: fetchErr } = await supabase.from('daily_prices').select('id, date, status, retail_sell_price');
  
  if (fetchErr) {
    console.error("Error fetching daily_prices:", fetchErr);
    return;
  }

  console.log(`Found ${prices?.length || 0} daily price records.`);

  // Delete all daily_prices records
  const { error: delErr } = await supabase
    .from('daily_prices')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delErr) {
    console.error("Error deleting daily_prices:", delErr);
  } else {
    console.log("✓ All daily_prices history cleared successfully.");
  }
}

resetDailyPrices();
