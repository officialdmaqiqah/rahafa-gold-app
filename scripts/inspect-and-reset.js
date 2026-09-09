const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectAndReset() {
  console.log("=== Inspecting Current Data ===");

  const { data: txs } = await supabase.from('transactions').select('id, invoice_number, transaction_type, total_amount, created_at');
  const { data: txItems } = await supabase.from('transaction_items').select('id');
  const { data: cashTxs } = await supabase.from('cash_transactions').select('id, description, amount');
  const { data: batches } = await supabase.from('stock_batches').select('id, batch_number, quantity_in, quantity_remaining');
  const { data: customers } = await supabase.from('customers').select('id, name');

  console.log(`Found:`);
  console.log(`- Transactions: ${txs?.length || 0}`);
  console.log(`- Transaction Items: ${txItems?.length || 0}`);
  console.log(`- Cash Transactions: ${cashTxs?.length || 0}`);
  console.log(`- Stock Batches: ${batches?.length || 0}`);
  console.log(`- Customers: ${customers?.length || 0}`);

  console.log("\n=== Resetting All Transactions ===");

  // 1. Delete all transaction_items
  const { error: errItems } = await supabase.from('transaction_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errItems) console.error("Error deleting transaction_items:", errItems);
  else console.log("✓ All transaction_items cleared.");

  // 2. Delete all transactions
  const { error: errTx } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errTx) console.error("Error deleting transactions:", errTx);
  else console.log("✓ All transactions (sales & buyback) cleared.");

  // 3. Delete all cash_transactions
  const { error: errCash } = await supabase.from('cash_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errCash) console.error("Error deleting cash_transactions:", errCash);
  else console.log("✓ All cash_transactions cleared.");

  // 4. Delete buyback stock batches created from sales/buyback
  const { error: errBB } = await supabase.from('stock_batches').delete().eq('source_type', 'buyback');
  if (errBB) console.error("Error deleting buyback stock batches:", errBB);
  else console.log("✓ All buyback stock_batches cleared.");

  // 5. Reset remaining stock for rest of stock batches back to quantity_in
  if (batches && batches.length > 0) {
    for (const b of batches) {
      await supabase.from('stock_batches').update({ quantity_remaining: b.quantity_in }).eq('id', b.id);
    }
    console.log(`✓ Reset quantity_remaining = quantity_in for ${batches.length} stock batches.`);
  }

  console.log("\n=== Reset Complete! System is clean for testing from scratch. ===");
}

inspectAndReset();
