"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getBuybackData() {
  const [productsRes, pricesRes, customersRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase.from("daily_prices").select("*").eq("status", "active").eq("date", new Date().toLocaleDateString('en-CA')),
    supabase.from("customers").select("*").order("name")
  ]);

  const priceMap = new Map();
  if (pricesRes.data) {
    pricesRes.data.forEach((p: any) => priceMap.set(p.product_id, p));
  }

  const products = (productsRes.data || []).map((p: any) => ({
    ...p,
    price: priceMap.get(p.id) || null
  }));

  return {
    products,
    customers: customersRes.data || []
  };
}

export async function checkoutBuyback(payload: any) {
  const { customerId, customerName, customerPhone, items, totalPaid, notes } = payload;
  
  let finalCustomerId = customerId;

  // 1. Create or get customer if new
  if (!finalCustomerId && customerName) {
    const { data: newCust, error: custErr } = await supabase.from("customers").insert([{
      name: customerName,
      phone: customerPhone,
      customer_type: "general"
    }]).select().single();
    
    if (custErr) return { error: "Gagal membuat customer baru: " + custErr.message };
    finalCustomerId = newCust.id;
  } else if (finalCustomerId && customerPhone) {
    // Update existing customer's phone number if provided
    await supabase.from("customers").update({ phone: customerPhone }).eq("id", finalCustomerId);
  }

  if (!finalCustomerId) {
    return { error: "Customer wajib diisi" };
  }

  const { data: settings } = await supabase.from("settings").select("buyback_prefix").limit(1);
  const prefix = settings && settings.length > 0 ? (settings[0].buyback_prefix || "BB") : "BB";

  // 2. Create Transaction
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const trxNumber = `${prefix}-${dateStr}-${randomStr}`;
  
  const totalAmount = items.reduce((acc: number, curr: any) => acc + (curr.qty * curr.unitPrice), 0);

  const { data: trx, error: trxErr } = await supabase.from("transactions").insert([{
    transaction_number: trxNumber,
    transaction_type: "buyback",
    customer_id: finalCustomerId,
    transaction_date: new Date().toLocaleDateString('en-CA'),
    total_amount: totalAmount,
    amount_paid: totalPaid,
    remaining_amount: 0,
    payment_method: "cash",
    status: "final",
    notes: notes
  }]).select().single();

  if (trxErr) return { error: "Gagal membuat transaksi: " + trxErr.message };

  // 3. Create Transaction Items and Stock Batches
  for (const item of items) {
    // a. Create stock_batch (Buyback = inbound stock)
    const { data: batch, error: batchErr } = await supabase.from("stock_batches").insert([{
      product_id: item.productId,
      source_type: "buyback",
      source_ref_id: trx.id,
      date_in: new Date().toLocaleDateString('en-CA'),
      quantity_in: item.qty,
      quantity_remaining: item.qty,
      cost_price: item.unitPrice, // the buyback price becomes the new cost price
      customer_id: finalCustomerId,
      status: "ready"
    }]).select().single();

    if (batchErr) return { error: "Gagal menambah stok buyback: " + batchErr.message };

    // b. Insert transaction item (profit = 0 for buyback purchases)
    const { error: itemErr } = await supabase.from("transaction_items").insert([{
      transaction_id: trx.id,
      product_id: item.productId,
      stock_batch_id: batch.id,
      quantity: item.qty,
      unit_price: item.unitPrice,
      cost_price: item.unitPrice,
      profit: 0
    }]);

    if (itemErr) return { error: "Gagal menyimpan item transaksi: " + itemErr.message };
  }

  revalidatePath("/stok");
  revalidatePath("/buyback");
  
  return { success: true, transactionId: trx.id };
}

export async function cancelBuyback(transactionId: string) {
  // 1. Cek apakah ada stock_batches dari transaksi ini yang sudah terjual
  const { data: batches } = await supabase
    .from("stock_batches")
    .select("id, quantity_in, quantity_remaining")
    .eq("source_ref_id", transactionId)
    .eq("source_type", "buyback");
    
  if (batches) {
    for (const batch of batches) {
      if (batch.quantity_remaining < batch.quantity_in) {
        return { error: "Buyback tidak dapat dibatalkan karena barang sudah laku terjual sebagian/seluruhnya." };
      }
    }
  }

  // 2. Batalkan stok (set remaining = 0, status = cancelled)
  const { error: cancelBatchErr } = await supabase
    .from("stock_batches")
    .update({ status: "cancelled", quantity_remaining: 0 })
    .eq("source_ref_id", transactionId)
    .eq("source_type", "buyback");

  if (cancelBatchErr) return { error: "Gagal membatalkan stok: " + cancelBatchErr.message };

  // 3. Batalkan transaksi
  const { error: trxErr } = await supabase
    .from("transactions")
    .update({ status: "cancelled" })
    .eq("id", transactionId);

  if (trxErr) return { error: "Gagal mengubah status transaksi: " + trxErr.message };

  revalidatePath("/stok");
  revalidatePath(`/buyback/${transactionId}`);

  return { success: true };
}
