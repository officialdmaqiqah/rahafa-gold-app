"use server";

import { supabase } from "@/lib/supabase";
import { verifySession } from "@/lib/auth";

export async function getReportSummary(startDate: string, endDate: string, type: string) {
  const session = await verifySession();
  const role = session?.role || "kasir";

  let query = supabase
    .from("transactions")
    .select(`
      *,
      customers (name),
      transaction_items (
        id,
        quantity,
        unit_price,
        profit,
        products (name, item_code, weight, unit)
      )
    `)
    .neq("status", "cancelled");

  if (startDate) {
    query = query.gte("transaction_date", startDate);
  }
  if (endDate) {
    query = query.lte("transaction_date", endDate);
  }
  
  if (type !== "all") {
    query = query.eq("transaction_type", type);
  }
  
  // order by date
  query = query.order("transaction_date", { ascending: false }).order("created_at", { ascending: false });

  const { data: transactions, error } = await query;
  if (error) return { error: error.message };

  let totalSalesGeneral = 0;
  let totalSalesReseller = 0;
  let totalBuyback = 0;
  let totalProfit = 0;
  let totalTransactions = 0;
  let totalPiutang = 0;
  
  let goodsOut = 0;

  const trxList: any[] = [];
  const itemsExport: any[] = []; // For detailed CSV
  
  // Product frequency tracking
  const productFreq: Record<string, number> = {};

  if (transactions) {
    transactions.forEach((trx: any) => {
      totalTransactions++;
      totalPiutang += (trx.remaining_amount || 0);

      if (trx.transaction_type === "sale_general") totalSalesGeneral += trx.total_amount;
      else if (trx.transaction_type === "sale_reseller") totalSalesReseller += trx.total_amount;
      else if (trx.transaction_type === "buyback") totalBuyback += trx.total_amount;
      
      let trxProfit = 0;
      let trxGoodsOut = 0;

      if (trx.transaction_items) {
        trx.transaction_items.forEach((item: any) => {
          if (trx.transaction_type !== "buyback") {
            trxProfit += (item.profit || 0);
            trxGoodsOut += item.quantity;
            goodsOut += item.quantity;
            
            const pName = item.products?.name || "Unknown";
            productFreq[pName] = (productFreq[pName] || 0) + item.quantity;
          }
          
          itemsExport.push({
            No_Transaksi: trx.transaction_number,
            Tanggal: trx.transaction_date,
            Tipe: trx.transaction_type,
            Pelanggan: trx.customers?.name || "Umum",
            Produk: item.products?.name,
            Qty: item.quantity,
            Harga_Satuan: item.unit_price,
            Total: item.quantity * item.unit_price,
            Profit: role !== "kasir" ? (item.profit || 0) : "-"
          });
        });
      }
      totalProfit += trxProfit;
      
      trxList.push({
        id: trx.id,
        transaction_number: trx.transaction_number,
        transaction_date: trx.transaction_date,
        transaction_type: trx.transaction_type,
        customer_name: trx.customers?.name || "Umum",
        total_amount: trx.total_amount,
        profit: role !== "kasir" ? trxProfit : null,
        goods_out: trxGoodsOut,
        remaining_amount: trx.remaining_amount
      });
    });
  }

  // Get Inbound Goods (Supplier + Buyback inside date range)
  let inboundQuery = supabase
    .from("stock_batches")
    .select("quantity_in, source_type")
    .neq("status", "cancelled");

  if (startDate) {
    inboundQuery = inboundQuery.gte("date_in", startDate);
  }
  if (endDate) {
    inboundQuery = inboundQuery.lte("date_in", endDate);
  }
  
  const { data: inboundBatches } = await inboundQuery;
  
  let goodsInSupplier = 0;
  let goodsInBuyback = 0;
  
  if (inboundBatches) {
    inboundBatches.forEach((b: any) => {
      if (b.source_type === "supplier" || b.source_type === "opening_stock" || b.source_type === "adjustment") {
         goodsInSupplier += b.quantity_in;
      } else if (b.source_type === "buyback") {
         goodsInBuyback += b.quantity_in;
      }
    });
  }

  const topProducts = Object.entries(productFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  // Fetch cash transactions (Kas)
  let cashQuery = supabase.from("cash_transactions").select("type, amount");
  if (startDate) {
    cashQuery = cashQuery.gte("date", startDate);
  }
  if (endDate) {
    cashQuery = cashQuery.lte("date", endDate);
  }
  const { data: cashData } = await cashQuery;
  
  let totalOperationalCosts = 0;
  let totalOtherIncomes = 0;
  if (cashData) {
    cashData.forEach((c: any) => {
      if (c.type === "OUT") totalOperationalCosts += Number(c.amount);
      if (c.type === "IN") totalOtherIncomes += Number(c.amount);
    });
  }

  const { data: settingsData } = await supabase.from("settings").select("store_name, tagline, phone").limit(1);
  const settings = settingsData && settingsData.length > 0 ? settingsData[0] : null;

  return {
    role,
    settings,
    summary: {
      totalSalesGeneral,
      totalSalesReseller,
      totalBuyback,
      totalProfit: role !== "kasir" ? totalProfit : null,
      totalTransactions,
      totalPiutang,
      goodsOut,
      goodsInSupplier,
      goodsInBuyback,
      totalOperationalCosts,
      totalOtherIncomes
    },
    topProducts,
    transactions: trxList,
    itemsExport
  };
}

export async function getStockValuationReport() {
  const session = await verifySession();
  const role = session?.role || "kasir";

  const { data: stockBatches, error: batchErr } = await supabase
    .from("stock_batches")
    .select(`
      id,
      quantity_remaining,
      cost_price,
      products (id, name, item_code, weight, unit, is_active)
    `)
    .gt("quantity_remaining", 0)
    .eq("status", "ready")
    .eq("products.is_active", true);

  if (batchErr) return { error: batchErr.message };

  const today = new Date().toLocaleDateString('en-CA');
  const { data: todayPrices } = await supabase
    .from("daily_prices")
    .select("*")
    .eq("status", "active")
    .eq("date", today);
    
  const priceMap = new Map();
  if (todayPrices) {
    todayPrices.forEach((p: any) => priceMap.set(p.product_id, p));
  }

  // Aggregate by product
  const productStocks: Record<string, any> = {};

  if (stockBatches) {
    stockBatches.forEach((b: any) => {
      const pid = b.products.id;
      if (!productStocks[pid]) {
        productStocks[pid] = {
          product_id: pid,
          name: b.products.name,
          code: b.products.item_code,
          weight: b.products.weight,
          unit: b.products.unit,
          total_qty: 0,
          total_modal: 0, // only for admin
          prices: priceMap.get(pid) || { retail_sell_price: 0, reseller_sell_price: 0, buyback_price: 0 },
          has_hold: false
        };
      }
      
      productStocks[pid].total_qty += b.quantity_remaining;
      productStocks[pid].total_modal += (b.quantity_remaining * b.cost_price);
      
      const p = productStocks[pid].prices;
      if (p.retail_sell_price > 0 && p.retail_sell_price < b.cost_price) {
        productStocks[pid].has_hold = true;
      }
    });
  }

  const result = Object.values(productStocks).map(p => {
    const potProfitUmum = (p.prices.retail_sell_price * p.total_qty) - p.total_modal;
    const potProfitReseller = (p.prices.reseller_sell_price * p.total_qty) - p.total_modal;
    
    return {
      ...p,
      total_modal: role !== "kasir" ? p.total_modal : null,
      pot_profit_umum: role !== "kasir" ? potProfitUmum : null,
      pot_profit_reseller: role !== "kasir" ? potProfitReseller : null
    };
  });

  return {
    role,
    stocks: result.sort((a, b) => a.name.localeCompare(b.name))
  };
}
