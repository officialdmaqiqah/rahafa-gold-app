const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanupDoubleProduct() {
  console.log("=== Checking products for double entry S0005 vs SA0005 / S005 vs SA005 ===");

  // Fetch products matching item_code or system_code or name containing S0005 / SA0005 / S005 / SA005
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .or('item_code.ilike.%S0005%,item_code.ilike.%S005%,system_code.ilike.%S0005%,system_code.ilike.%S005%,name.ilike.%Sale Antam 0.5%');

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log("Found products:", products);

  // Also let's check all products with 'Sale' in their name
  const { data: allSaleProducts, error: saleErr } = await supabase
    .from('products')
    .select('id, item_code, system_code, name, is_active')
    .ilike('name', '%Sale%');

  if (!saleErr && allSaleProducts) {
    console.log("All Sale Products in DB:", allSaleProducts);
  }

  // Find target duplicate S0005 / Sale Antam 0.5 Gram
  const duplicate = (allSaleProducts || products || []).find(
    p => (p.item_code === 'S0005' || p.item_code === 'S005' || p.system_code === 'S0005' || (p.name && p.name.trim() === 'Sale Antam 0.5 Gram'))
  );

  if (duplicate) {
    console.log(`Found duplicate product to deactivate/delete: ID=${duplicate.id}, Code=${duplicate.item_code}, Name="${duplicate.name}"`);

    // Check if there are stock batches or transaction items associated with this product
    const { data: batches } = await supabase.from('stock_batches').select('id, quantity_remaining').eq('product_id', duplicate.id);
    const { data: txItems } = await supabase.from('transaction_items').select('id').eq('product_id', duplicate.id);

    console.log(`Associated stock batches: ${batches?.length || 0}, transaction items: ${txItems?.length || 0}`);

    if ((batches?.length || 0) === 0 && (txItems?.length || 0) === 0) {
      // Hard delete daily_prices draft first if any
      await supabase.from('daily_prices').delete().eq('product_id', duplicate.id);
      
      // Hard delete product
      const { error: delErr } = await supabase.from('products').delete().eq('id', duplicate.id);
      if (delErr) {
        console.error("Failed to delete product, falling back to deactivating:", delErr);
        await supabase.from('products').update({ is_active: false }).eq('id', duplicate.id);
        console.log(`Product ID ${duplicate.id} deactivated (is_active = false).`);
      } else {
        console.log(`Product ID ${duplicate.id} (${duplicate.item_code} - ${duplicate.name}) successfully DELETED from database.`);
      }
    } else {
      // Soft delete by setting is_active = false
      await supabase.from('products').update({ is_active: false }).eq('id', duplicate.id);
      console.log(`Product ID ${duplicate.id} has history/stock, so set is_active = false.`);
    }
  } else {
    console.log("No duplicate product S0005 / Sale Antam 0.5 Gram found in database or already cleaned.");
  }
}

cleanupDoubleProduct();
