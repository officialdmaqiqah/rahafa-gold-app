const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const mode = process.argv[2] === '--undo' ? 'undo' : 'format';
  
  console.log(`Starting in ${mode} mode...`);

  // Fetch all products
  const { data: products, error } = await supabase.from('products').select('id, item_code');
  
  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  let updatedCount = 0;

  for (const product of products) {
    const code = product.item_code;
    if (!code) continue;

    // Match patterns like "A5", "LM10", "C-375-1"
    // For this simple script, we look for letters followed by numbers at the end.
    // e.g. "A" and "5" -> "A005"
    const match = code.match(/^([A-Za-z]+[-]?\d*[-]?)([0-9]+)$/);
    
    if (match) {
      const prefix = match[1];
      const numberPart = match[2];

      let newCode = code;

      if (mode === 'format') {
        // Pad the number to 3 digits (or keep it if it's already longer)
        const paddedNumber = numberPart.padStart(3, '0');
        newCode = prefix + paddedNumber;
      } else if (mode === 'undo') {
        // Remove leading zeroes
        const unpaddedNumber = parseInt(numberPart, 10).toString();
        newCode = prefix + unpaddedNumber;
      }

      if (newCode !== code) {
        console.log(`Changing ${code} -> ${newCode}`);
        const { error: updateErr } = await supabase
          .from('products')
          .update({ item_code: newCode })
          .eq('id', product.id);
          
        if (updateErr) {
          console.error(`Failed to update ${code}:`, updateErr);
        } else {
          updatedCount++;
        }
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} products.`);
}

run();
