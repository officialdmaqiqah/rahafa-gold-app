require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rawData = `
A05 | A05 | ANTAM 0.5 Gram | Emas | ANTAM | 0.5 gram | Harga awal 1,566,000
A1 | A1 | ANTAM 1 Gram | Emas | ANTAM | 1 gram | Harga awal 2,852,000
A2 | A2 | ANTAM 2 Gram | Emas | ANTAM | 2 gram | Harga awal 5,554,000
A3 | A3 | ANTAM 3 Gram | Emas | ANTAM | 3 gram | Harga awal 8,251,000
A5 | A5 | ANTAM 5 Gram | Emas | ANTAM | 5 gram | Harga awal 13,285,000
A10 | A10 | ANTAM 10 Gram | Emas | ANTAM | 10 gram | Harga awal 26,270,000
A25 | A25 | ANTAM 25 Gram | Emas | ANTAM | 25 gram | Harga awal 65,375,000
A50 | A50 | ANTAM 50 Gram | Emas | ANTAM | 50 gram | Harga awal 130,850,000
A100 | A100 | ANTAM 100 Gram | Emas | ANTAM | 100 gram | Harga awal 261,200,000
R05 | R05 | RETRO ANTAM 0.5 GRAM | Emas | RETRO ANTAM | 0.5 gram | Harga awal 1,565,000
R1 | R1 | RETRO ANTAM 1 GRAM | Emas | RETRO ANTAM | 1 gram | Harga awal 2,746,000
R2 | R2 | RETRO ANTAM 2 GRAM | Emas | RETRO ANTAM | 2 gram | Harga awal 5,412,000
R2,5 | R2_5 | RETRO ANTAM 2,5 GRAM | Emas | RETRO ANTAM | 2.5 gram | Harga awal 6,871,000
R3 | R3 | RETRO ANTAM 3 GRAM | Emas | RETRO ANTAM | 3 gram | Harga awal 8,183,000
R5 | R5 | RETRO ANTAM 5 GRAM | Emas | RETRO ANTAM | 5 gram | Harga awal 13,330,000
R10 | R10 | RETRO ANTAM 10 GRAM | Emas | RETRO ANTAM | 10 gram | Harga awal 26,760,000
RG0025 | RG0025 | MINIGOLD REGULER 0.025 | Emas | MINIGOLD REGULER | 0.025 gram | Harga awal 73,000
RG005 | RG005 | MINIGOLD REGULER 0.05 | Emas | MINIGOLD REGULER | 0.05 gram | Harga awal 136,000
RG01 | RG01 | MINIGOLD REGULER 0.1 | Emas | MINIGOLD REGULER | 0.1 gram | Harga awal 265,000
RG025 | RG025 | MINIGOLD REGULER 0.25 | Emas | MINIGOLD REGULER | 0.25 gram | Harga awal 658,000
RG05 | RG05 | MINIGOLD REGULER 0.5 | Emas | MINIGOLD REGULER | 0.5 gram | Harga awal 1,272,000
RG1 | RG1 | MINIGOLD REGULER 1 | Emas | MINIGOLD REGULER | 1 gram | Harga awal 2,526,000
RG15 | RG15 | MINIGOLD REGULER 1.5 | Emas | MINIGOLD REGULER | 1.5 gram | Harga awal 3,747,000
M01 | M01 | MICRO GOLD 0.1 | Emas | MICRO GOLD | 0.1 gram | Harga awal 408,000
M025 | M025 | MICRO GOLD 0.25 | Emas | MICRO GOLD | 0.25 gram | Harga awal 844,000
S3,3 | S3_3 | SILVERIUM REGULER 3,3 GRAM | Perak | SILVERIUM REGULER | 3.3 gram | Harga awal 185,000
S9,9 | S9_9 | SILVERIUM REGULER 9,9 GRAM | Perak | SILVERIUM REGULER | 9.9 gram | Harga awal 547,000
S33 | S33 | SILVERIUM REGULER 33 GRAM | Perak | SILVERIUM REGULER | 33 gram | Harga awal 1,762,000
S50 | S50 | SILVERIUM REGULER 50 GRAM | Perak | SILVERIUM REGULER | 50 gram | Harga awal 2,700,000
S99 | S99 | SILVERIUM REGULER 99 GRAM | Perak | SILVERIUM REGULER | 99 gram | Harga awal 5,258,000
S250 | S250 | SILVERIUM REGULER 250 GRAM | Perak | SILVERIUM REGULER | 250 gram | Harga awal 12,985,000
S500 | S500 | SILVERIUM REGULER 500 GRAM | Perak | SILVERIUM REGULER | 500 gram | Harga awal 25,295,000
D1 | D1 | 1 DIRHAM ABA | Perak | DIRHAM ABA | 3.11 dirham | Harga awal 184,000
D5 | D5 | 5 DIRHAM ABA | Perak | DIRHAM ABA | 15.55 dirham | Harga awal 879,000
RP1 | RP1 | 1 RUPIYA | Perak | RUPIYA | 3.11 rupiya | Harga awal 156,000
RP5 | RP5 | 5 RUPIYA | Perak | RUPIYA | 15.55 rupiya | Harga awal 754,000
S5 IDUL FITRI | S5_IDUL_FITRI | SILVERIUM IDUL FITRI 5 GR | Perak | SILVERIUM IDUL FITRI | 5 gram | Harga awal 322,000
S25 IDUL FITRI | S25_IDUL_FITRI | SILVERIUM LIMITED EDITION 25 GR | Perak | SILVERIUM LIMITED EDITION | 25 gram | Harga awal 1,417,000
S50 IDUL FITRI | S50_IDUL_FITRI | SILVERIUM LIMITED EDITION 50 GR | Perak | SILVERIUM LIMITED EDITION | 50 gram | Harga awal 2,822,000
S100 IDUL FITRI | S100_IDUL_FITRI | SILVERIUM LIMITED EDITION 100 GR | Perak | SILVERIUM LIMITED EDITION | 100 gram | Harga awal 5,484,000
SP | SP | SILVERIUM PALESTINE 31.1 GRAM | Perak | SILVERIUM PALESTINE | 31.1 gram | Harga awal 1,858,000
SAH99 | SAH99 | SILVERIUM ASMAUL HUSNA 99 GRAM | Perak | SILVERIUM ASMAUL HUSNA | 99 gram | Harga awal 5,258,000
`;

async function seed() {
  const lines = rawData.trim().split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse line: Item Code | System Code | Name | Category | Type | Weight | Price
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 7) continue;

    const [itemCode, systemCode, name, categoryRaw, type, weightStr, priceStr] = parts;
    const category = categoryRaw.toLowerCase() === 'emas' ? 'gold' : 'silver';
    const weight = parseFloat(weightStr.replace(' gram', '').replace(' dirham', '').replace(' rupiya', '').trim());
    
    let unit = 'gram';
    if (weightStr.includes('dirham')) unit = 'dirham';
    if (weightStr.includes('rupiya')) unit = 'rupiya';

    const price = parseInt(priceStr.replace(/[^0-9]/g, ''));

    console.log(`Processing: ${name}`);

    // Upsert Product by system_code
    // Note: Supabase doesn't easily support upsert on non-PK columns unless it's a unique constraint in the API. 
    // We added UNIQUE constraint to system_code, so we can use onConflict.
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .upsert({
        item_code: itemCode,
        system_code: systemCode,
        name: name,
        category: category,
        type: type,
        weight: weight,
        unit: unit,
        is_active: true
      }, { onConflict: 'system_code' })
      .select()
      .single();

    if (prodErr) {
      console.error(`Error upserting product ${systemCode}:`, prodErr);
      continue;
    }

    const productId = product.id;
    const today = new Date().toISOString().split('T')[0];

    // Upsert daily price draft for today
    // We check if a price for today already exists
    const { data: existingPrice } = await supabase
      .from('daily_prices')
      .select('id')
      .eq('product_id', productId)
      .eq('date', today)
      .single();

    if (!existingPrice) {
      const { error: priceErr } = await supabase
        .from('daily_prices')
        .insert({
          product_id: productId,
          date: today,
          retail_sell_price: price,
          reseller_sell_price: null,
          buyback_price: null,
          status: 'draft'
        });

      if (priceErr) {
        console.error(`Error inserting price for ${systemCode}:`, priceErr);
      }
    } else {
        // Update existing price if it's draft
        await supabase
        .from('daily_prices')
        .update({
          retail_sell_price: price
        })
        .eq('id', existingPrice.id)
        .eq('status', 'draft');
    }
  }
  
  console.log("Seeding completed.");
}

seed();
