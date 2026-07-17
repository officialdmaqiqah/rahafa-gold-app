"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getPosData() {
  const [productsRes, pricesRes, customersRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase.from("daily_prices").select("*").eq("status", "active").order("date", { ascending: false }),
    supabase.from("customers").select("*").order("name")
  ]);

  const priceMap = new Map();
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  if (pricesRes.data) {
    pricesRes.data.forEach((p: any) => {
      // Set only the latest price (since it's ordered by date DESC)
      if (!priceMap.has(p.product_id)) {
        priceMap.set(p.product_id, p);
      }
    });
  }

  let hasMissingTodayPrice = false;
  const products = (productsRes.data || []).map((p: any) => {
    const latestPrice = priceMap.get(p.id) || null;
    if (latestPrice && latestPrice.date !== todayStr) {
      hasMissingTodayPrice = true;
    } else if (!latestPrice) {
      hasMissingTodayPrice = true; // No price at all also counts as missing today's price
    }
    
    return {
      ...p,
      price: latestPrice
    };
  });

  return {
    products,
    customers: customersRes.data || [],
    hasMissingTodayPrice
  };
}

// Logic to simulate allocation
async function simulateAllocation(productId: string, requestedQty: number, sellPrice: number) {
  const { data: batches } = await supabase
    .from("stock_batches")
    .select("*")
    .eq("product_id", productId)
    .in("status", ["ready", "hold"])
    .gt("quantity_remaining", 0);

  if (!batches || batches.length === 0) return { allocated: [], remainingQty: requestedQty, isMinus: false };

  // Sort batches:
  // 1. Where cost_price <= sellPrice, sort by cost_price DESC
  // 2. Where cost_price > sellPrice, sort by cost_price ASC (to minimize loss)
  const safeBatches = batches.filter((b: any) => b.cost_price <= sellPrice).sort((a: any, b: any) => b.cost_price - a.cost_price);
  const unsafeBatches = batches.filter((b: any) => b.cost_price > sellPrice).sort((a: any, b: any) => a.cost_price - b.cost_price);

  const sortedBatches = [...safeBatches, ...unsafeBatches];

  let remaining = requestedQty;
  const allocated = [];
  let isMinus = false;

  for (const batch of sortedBatches) {
    if (remaining <= 0) break;
    
    const qtyToTake = Math.min(batch.quantity_remaining, remaining);
    allocated.push({
      batch_id: batch.id,
      cost_price: batch.cost_price,
      quantity: qtyToTake
    });
    
    if (batch.cost_price > sellPrice) {
      isMinus = true;
    }

    remaining -= qtyToTake;
  }

  return {
    allocated,
    remainingQty: remaining, // if > 0, means insufficient stock
    isMinus
  };
}

export async function validateCart(cartItems: any[]) {
  let hasMinus = false;
  let hasInsufficientStock = false;
  const validations = [];

  for (const item of cartItems) {
    const alloc = await simulateAllocation(item.productId, item.qty, item.unitPrice);
    if (alloc.remainingQty > 0) hasInsufficientStock = true;
    if (alloc.isMinus) hasMinus = true;
    
    validations.push({
      productId: item.productId,
      ...alloc
    });
  }

  return {
    hasMinus,
    hasInsufficientStock,
    validations
  };
}

export async function checkout(payload: any, overrideFlag: boolean) {
  const { customerId, customerName, customerPhone, transactionType, items, amountPaid, paymentMethod, notes } = payload;
  
  let finalCustomerId = customerId;

  // 1. Create or get customer if new
  if (!finalCustomerId && customerName) {
    const { data: newCust, error: custErr } = await supabase.from("customers").insert([{
      name: customerName,
      phone: customerPhone,
      customer_type: transactionType === "sale_reseller" ? "reseller" : "general"
    }]).select().single();
    
    if (custErr) throw new Error("Gagal membuat customer baru: " + custErr.message);
    finalCustomerId = newCust.id;
  } else if (finalCustomerId && customerPhone) {
    // Update existing customer's phone number if provided
    await supabase.from("customers").update({ phone: customerPhone }).eq("id", finalCustomerId);
  }

  // 2. Validate Cart & Allocate
  const validation = await validateCart(items);
  
  if (validation.hasInsufficientStock) {
    throw new Error("Stok tidak mencukupi untuk beberapa barang.");
  }

  if (validation.hasMinus && !overrideFlag) {
    throw new Error("Ada barang yang dijual di bawah modal. Gunakan Override untuk memaksa.");
  }

  const { data: settings } = await supabase.from("settings").select("invoice_prefix").limit(1);
  const prefix = settings && settings.length > 0 ? (settings[0].invoice_prefix || "INV") : "INV";

  // 3. Create Transaction
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const trxNumber = `${prefix}-${dateStr}-${randomStr}`;
  
  const totalAmount = items.reduce((acc: number, curr: any) => acc + (curr.qty * curr.unitPrice), 0);
  const remainingAmount = totalAmount - amountPaid;

  const { data: trx, error: trxErr } = await supabase.from("transactions").insert([{
    transaction_number: trxNumber,
    transaction_type: transactionType,
    customer_id: finalCustomerId,
    transaction_date: new Date().toLocaleDateString('en-CA'),
    total_amount: totalAmount,
    amount_paid: amountPaid,
    remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
    payment_method: paymentMethod || "cash",
    status: "final",
    notes: notes
  }]).select().single();

  if (trxErr) throw new Error("Gagal membuat transaksi: " + trxErr.message);

  // 4. Create Transaction Items and Deduct Stock
  for (const item of items) {
    const allocItem = validation.validations.find(v => v.productId === item.productId);
    if (!allocItem) continue;

    for (const alloc of allocItem.allocated) {
      // Deduct stock
      const { data: batch } = await supabase.from("stock_batches").select("quantity_remaining").eq("id", alloc.batch_id).single();
      if (batch) {
        const newQty = batch.quantity_remaining - alloc.quantity;
        await supabase.from("stock_batches").update({
          quantity_remaining: newQty,
          status: newQty === 0 ? "sold_out" : "ready"
        }).eq("id", alloc.batch_id);
      }

      // Insert item
      const profit = (item.unitPrice - alloc.cost_price) * alloc.quantity;
      await supabase.from("transaction_items").insert([{
        transaction_id: trx.id,
        product_id: item.productId,
        stock_batch_id: alloc.batch_id,
        quantity: alloc.quantity,
        unit_price: item.unitPrice,
        cost_price: alloc.cost_price,
        profit: profit
      }]);
    }
  }

  revalidatePath("/stok");
  revalidatePath("/buat-invoice");
  
  return { success: true, transactionId: trx.id, error: undefined };
}
