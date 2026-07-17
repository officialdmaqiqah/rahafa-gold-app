const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(
  envConfig.NEXT_PUBLIC_SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function clearData() {
  console.log("Starting data wipe...");
  
  // 1. Delete all transaction_items
  const { error: e1 } = await supabase.from('transaction_items').delete().neq('id', 0);
  console.log("transaction_items deleted:", e1 ? e1.message : "Success");

  // 2. Delete all transactions
  const { error: e2 } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("transactions deleted:", e2 ? e2.message : "Success");
  
  // 3. Delete all cash_transactions
  const { error: e3 } = await supabase.from('cash_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("cash_transactions deleted:", e3 ? e3.message : "Success");

  // 4. Delete buyback stock batches
  const { error: e4 } = await supabase.from('stock_batches').delete().eq('source_type', 'buyback');
  console.log("buyback batches deleted:", e4 ? e4.message : "Success");

  // 5. Reset remaining quantity for all other batches
  const { data: batches } = await supabase.from('stock_batches').select('id, quantity_in');
  if (batches) {
      for (const b of batches) {
         await supabase.from('stock_batches').update({ quantity_remaining: b.quantity_in }).eq('id', b.id);
      }
      console.log(`Stock reset for ${batches.length} batches`);
  }

  // 6. Optional: Delete customers (if wanted, but keeping them is fine. Let's keep customers).

  console.log("DONE");
}
clearData();
