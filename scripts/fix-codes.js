const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const mapping = [
  ['A05', 'A0005', 'A005'],
  ['A1', 'A001', 'A001'],
  ['A2', 'A002', 'A002'],
  ['A3', 'A003', 'A003'],
  ['A5', 'A005', 'A005'],
  ['A10', 'A1000', 'A010'],
  ['A25', 'A2005', 'A025'],
  ['A50', 'A5000', 'A050'],
  ['A100', 'A10000', 'A100'],
  ['R05', 'R0005', 'R005'],
  ['R1', 'R001', 'R001'],
  ['R2', 'R002', 'R002'],
  ['R3', 'R003', 'R003'],
  ['R5', 'R005', 'R005'],
  ['R10', 'R1000', 'R010'],
  ['RG0025', 'RG002005', 'RG0025'],
  ['RG005', 'RG00005', 'RG005'],
  ['RG01', 'RG0001', 'RG001'],
  ['RG025', 'RG02005', 'RG025'],
  ['RG05', 'RG0005', 'RG005'],
  ['RG1', 'RG001', 'RG001'],
  ['RG15', 'RG1005', 'RG015'],
  ['M01', 'M0001', 'M001'],
  ['M025', 'M02005', 'M025'],
  ['S33', 'S3003', 'S033'],
  ['S50', 'S5000', 'S050'],
  ['S99', 'S9009', 'S099'],
  ['S250', 'S25000', 'S250'],
  ['S500', 'S50000', 'S500'],
  ['D1', 'D001', 'D001'],
  ['D5', 'D005', 'D005'],
  ['RP1', 'RP001', 'RP001'],
  ['RP5', 'RP005', 'RP005'],
  ['SAH99', 'SAH9009', 'SAH099'],
  ['TG1', 'TG001', 'TG001'],
  ['TS1', 'TS001', 'TS001'],
];

async function run() {
  const mode = process.argv[2]; // 'undo' to revert
  
  for (const [orig, bad, correct] of mapping) {
     const currentTarget = mode === 'undo' ? orig : correct;
     
     const { data } = await supabase.from('products')
        .select('id, item_code')
        .in('item_code', [orig, bad, correct]);
     
     for (const product of (data || [])) {
        if (product.item_code !== currentTarget) {
            console.log(`Updating ${product.item_code} -> ${currentTarget}`);
            await supabase.from('products').update({ item_code: currentTarget }).eq('id', product.id);
        }
     }
  }
  console.log('Done!');
}

run();
