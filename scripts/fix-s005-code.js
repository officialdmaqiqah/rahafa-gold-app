const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixS005() {
  console.log("=== Updating item_code S005 -> SA005 ===");

  const { data: prod, error } = await supabase
    .from('products')
    .select('*')
    .or('item_code.eq.S005,system_code.eq.SA5')
    .single();

  if (error || !prod) {
    console.error("Product not found or error:", error);
    return;
  }

  console.log(`Found product: ID=${prod.id}, current item_code=${prod.item_code}, name=${prod.name}`);

  const { error: updateErr } = await supabase
    .from('products')
    .update({ item_code: 'SA005', name: prod.name.trim() })
    .eq('id', prod.id);

  if (updateErr) {
    console.error("Failed to update item_code:", updateErr);
  } else {
    console.log(`Successfully updated item_code from '${prod.item_code}' to 'SA005'.`);
  }
}

fixS005();
