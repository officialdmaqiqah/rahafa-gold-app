"use server";

import { supabase } from "@/lib/supabase";

export async function getStockData(search?: string, category?: string) {
  // Get active products
  let pQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("item_code", { ascending: true });

  if (category && category !== "all") {
    pQuery = pQuery.eq("category", category);
  }

  if (search) {
    pQuery = pQuery.or(`item_code.ilike.%${search}%,name.ilike.%${search}%,type.ilike.%${search}%`);
  }

  const { data: products, error: pErr } = await pQuery;
  if (pErr) throw new Error(pErr.message);

  // Get active today price
  const today = new Date().toLocaleDateString('en-CA');
  const { data: prices, error: prErr } = await supabase
    .from("daily_prices")
    .select("*")
    .eq("status", "active")
    .eq("date", today);

  if (prErr) throw new Error(prErr.message);
  
  const priceMap = new Map();
  prices.forEach(p => priceMap.set(p.product_id, p));

  // Get stock batches that are not sold out or cancelled
  const { data: batches, error: bErr } = await supabase
    .from("stock_batches")
    .select("*")
    .in("status", ["ready", "hold"])
    .gt("quantity_remaining", 0);

  if (bErr) throw new Error(bErr.message);

  const batchMap = new Map();
  batches.forEach(b => {
    if (!batchMap.has(b.product_id)) {
      batchMap.set(b.product_id, []);
    }
    batchMap.get(b.product_id).push(b);
  });

  // Get settings for minimum margin
  const { data: settings } = await supabase.from("settings").select("minimum_margin_amount, minimum_margin_percent").limit(1);
  const minMarginAmount = settings && settings.length > 0 ? (settings[0].minimum_margin_amount || 0) : 0;
  const minMarginPercent = settings && settings.length > 0 ? (settings[0].minimum_margin_percent || 0) : 0;

  return products.map(prod => {
    const prodBatches = batchMap.get(prod.id) || [];
    const totalStock = prodBatches.reduce((acc: number, curr: any) => acc + curr.quantity_remaining, 0);
    const activePrice = priceMap.get(prod.id) || null;

    return {
      product: prod,
      totalStock,
      batches: prodBatches,
      activePrice,
      minMargin: minMarginAmount,
      minMarginPercent: minMarginPercent
    };
  });
}
