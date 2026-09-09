"use server";

import { supabase } from "@/lib/supabase";
import { verifySession } from "@/lib/auth";

export async function getDashboardData() {
  const session = await verifySession();
  const role = session?.role || "kasir";

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  // 7 Days ago
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const sevenDaysAgo = d.toLocaleDateString('en-CA');

  // Parallelize all independent database queries
  const todayTransactionsPromise = supabase
    .from("transactions")
    .select("transaction_type, total_amount, remaining_amount, id")
    .eq("transaction_date", today)
    .neq("status", "cancelled");

  const todayItemsPromise = role !== "kasir"
    ? supabase
        .from("transaction_items")
        .select("profit, transactions!inner(transaction_date, status)")
        .eq("transactions.transaction_date", today)
        .neq("transactions.status", "cancelled")
    : Promise.resolve({ data: null });

  const receivablesPromise = supabase
    .from("transactions")
    .select("remaining_amount")
    .gt("remaining_amount", 0)
    .neq("status", "cancelled");

  const recentTransactionsPromise = supabase
    .from("transactions")
    .select("*, customers(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const weeklyItemsPromise = supabase
    .from("transaction_items")
    .select("quantity, products(name), transactions!inner(transaction_date, status)")
    .gte("transactions.transaction_date", sevenDaysAgo)
    .neq("transactions.status", "cancelled");

  const stockBatchesPromise = supabase
    .from("stock_batches")
    .select("quantity_remaining, cost_price, products!inner(id, name, is_active)")
    .gt("quantity_remaining", 0)
    .eq("status", "ready")
    .eq("products.is_active", true);

  const todayPricesPromise = supabase
    .from("daily_prices")
    .select("product_id, retail_sell_price")
    .eq("status", "active")
    .eq("date", today);

  const settingsPromise = supabase
    .from("settings")
    .select("minimum_margin_amount, minimum_margin_percent")
    .limit(1);

  const [
    { data: todayTransactions },
    { data: todayItems },
    { data: receivablesData },
    { data: recentTransactions },
    { data: weeklyItems },
    { data: stockBatches },
    { data: todayPrices },
    { data: settingsData }
  ] = await Promise.all([
    todayTransactionsPromise,
    todayItemsPromise,
    receivablesPromise,
    recentTransactionsPromise,
    weeklyItemsPromise,
    stockBatchesPromise,
    todayPricesPromise,
    settingsPromise
  ]);

  let salesGeneralToday = 0;
  let salesResellerToday = 0;
  let buybackToday = 0;
  let transactionsCountToday = 0;

  if (todayTransactions) {
    todayTransactions.forEach((t: any) => {
      transactionsCountToday++;
      if (t.transaction_type === "sale_general") salesGeneralToday += t.total_amount;
      else if (t.transaction_type === "sale_reseller") salesResellerToday += t.total_amount;
      else if (t.transaction_type === "buyback") buybackToday += t.total_amount;
    });
  }

  // 2. Estimated Profit Today
  let estimatedProfitToday = 0;
  if (role !== "kasir" && todayItems) {
    estimatedProfitToday = todayItems.reduce((acc: number, item: any) => acc + (item.profit || 0), 0);
  }

  // 3. Receivables (Piutang)
  const totalReceivables = receivablesData?.reduce((acc: number, t: any) => acc + (t.remaining_amount || 0), 0) || 0;

  // 4. Most sold products this week
  const productCounts: Record<string, number> = {};
  if (weeklyItems) {
    weeklyItems.forEach((item: any) => {
      if (item.transactions.status !== "cancelled" && (item.transactions.transaction_type !== "buyback")) {
        const name = item.products?.name || "Unknown";
        productCounts[name] = (productCounts[name] || 0) + item.quantity;
      }
    });
  }
  const topProducts = Object.entries(productCounts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 5. Hold Stock Calculation
  const priceMap = new Map();
  if (todayPrices) {
    todayPrices.forEach((p: any) => priceMap.set(p.product_id, p.retail_sell_price));
  }

  const minMarginAmount = settingsData && settingsData.length > 0 ? (settingsData[0].minimum_margin_amount || 0) : 0;
  const minMarginPercent = settingsData && settingsData.length > 0 ? (settingsData[0].minimum_margin_percent || 0) : 0;

  const holdStocks: Record<string, any> = {};
  let holdStockCount = 0;
  
  if (stockBatches) {
    stockBatches.forEach((batch: any) => {
      const activePrice = priceMap.get(batch.products.id) || 0;
      if (activePrice > 0) {
        const profit = activePrice - batch.cost_price;
        const profitPercent = (profit / batch.cost_price) * 100;
        
        const isHold = profit < 0;
        const isMarginTipis = (minMarginAmount > 0 && profit < minMarginAmount) || (minMarginPercent > 0 && profitPercent < minMarginPercent);
        
        if (isHold || isMarginTipis) {
          holdStockCount++;
          const prodName = batch.products.name;
          if (!holdStocks[prodName]) {
            holdStocks[prodName] = { name: prodName, qty: 0, cost_price: batch.cost_price, active_price: activePrice };
          }
          holdStocks[prodName].qty += batch.quantity_remaining;
          if (batch.cost_price > holdStocks[prodName].cost_price) {
            holdStocks[prodName].cost_price = batch.cost_price; // Track highest cost price
          }
        }
      }
    });
  }
  
  const topHoldStocks = Object.values(holdStocks)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    role,
    summary: {
      salesGeneralToday,
      salesResellerToday,
      buybackToday,
      estimatedProfitToday,
      transactionsCountToday,
      totalReceivables,
      holdStockCount
    },
    recentTransactions: recentTransactions || [],
    topProducts,
    topHoldStocks
  };
}

export async function getLogamMuliaPrices() {
  try {
    // Fetch server-side to bypass any CORS restrictions
    const res = await fetch('https://logam-mulia-api.iamutaki.workers.dev/api/prices/logammulia', {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Failed to fetch Logam Mulia prices server-side:", err);
    return null;
  }
}
