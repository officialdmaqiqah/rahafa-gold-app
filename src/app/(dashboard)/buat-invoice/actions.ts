"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { verifyOwnerPin } from "@/lib/auth";

export async function getPosData(targetDate?: string) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const chosenDate = targetDate || todayStr;

  const [productsRes, pricesRes, customersRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase
      .from("daily_prices")
      .select("*")
      .eq("date", chosenDate)
      .order("created_at", { ascending: false }),
    supabase.from("customers").select("*").order("name")
  ]);

  const priceMap = new Map();
  if (pricesRes.data && pricesRes.data.length > 0) {
    const activePrices = pricesRes.data.filter((p: any) => p.status === 'active');
    const sourcePrices = activePrices.length > 0 ? activePrices : pricesRes.data;
    
    sourcePrices.forEach((p: any) => {
      if (!priceMap.has(p.product_id)) {
        priceMap.set(p.product_id, p);
      }
    });
  }

  let hasMissingTodayPrice = false;
  const products = (productsRes.data || []).map((p: any) => {
    const pr = priceMap.get(p.id) || null;
    if (!pr || !pr.retail_sell_price || pr.retail_sell_price <= 0) {
      hasMissingTodayPrice = true;
    }
    
    return {
      ...p,
      price: pr
    };
  });

  const todayMs = new Date(todayStr + "T00:00:00Z").getTime();
  const chosenMs = new Date(chosenDate + "T00:00:00Z").getTime();
  const diffDays = Math.round((todayMs - chosenMs) / 86400000);

  return {
    products,
    customers: customersRes.data || [],
    hasMissingTodayPrice,
    chosenDate,
    isBackdated: diffDays > 0,
    diffDays
  };
}

export async function getPricesForDate(targetDate: string) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const chosenDate = targetDate || todayStr;

  const [productsRes, pricesRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase
      .from("daily_prices")
      .select("*")
      .eq("date", chosenDate)
      .order("created_at", { ascending: false })
  ]);

  const priceMap = new Map();
  if (pricesRes.data && pricesRes.data.length > 0) {
    const activePrices = pricesRes.data.filter((p: any) => p.status === 'active');
    const sourcePrices = activePrices.length > 0 ? activePrices : pricesRes.data;
    
    sourcePrices.forEach((p: any) => {
      if (!priceMap.has(p.product_id)) {
        priceMap.set(p.product_id, p);
      }
    });
  }

  let hasMissingPrice = false;
  const products = (productsRes.data || []).map((p: any) => {
    const pr = priceMap.get(p.id) || null;
    if (!pr || !pr.retail_sell_price || pr.retail_sell_price <= 0) {
      hasMissingPrice = true;
    }
    return {
      ...p,
      price: pr
    };
  });

  const todayMs = new Date(todayStr + "T00:00:00Z").getTime();
  const chosenMs = new Date(chosenDate + "T00:00:00Z").getTime();
  const diffDays = Math.round((todayMs - chosenMs) / 86400000);

  return {
    targetDate: chosenDate,
    products,
    hasMissingPrice,
    diffDays,
    isBackdated: diffDays > 0,
    isDeepBackdated: diffDays > 1
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

  const validations = await Promise.all(
    cartItems.map(async (item) => {
      const alloc = await simulateAllocation(item.productId, item.qty, item.unitPrice);
      return {
        productId: item.productId,
        ...alloc
      };
    })
  );

  for (const val of validations) {
    if (val.remainingQty > 0) hasInsufficientStock = true;
    if (val.isMinus) hasMinus = true;
  }

  return {
    hasMinus,
    hasInsufficientStock,
    validations
  };
}

export async function checkout(payload: any, overrideFlag: boolean, ownerPin?: string) {
  const { 
    customerId, 
    customerName, 
    customerPhone, 
    transactionType, 
    items, 
    amountPaid, 
    paymentMethod, 
    notes,
    transactionDate,
    backdateReason,
    manualPriceOverride,
    priceSourceDate
  } = payload;
  
  let finalCustomerId = customerId;

  // 1. Validasi tanggal transaksi
  const todayStr = new Date().toLocaleDateString('en-CA');
  const trxDate = transactionDate || todayStr;

  if (trxDate > todayStr) {
    throw new Error("Tanggal transaksi tidak boleh lebih dari hari ini.");
  }

  const todayMs = new Date(todayStr + "T00:00:00Z").getTime();
  const trxMs = new Date(trxDate + "T00:00:00Z").getTime();
  const diffDays = Math.round((todayMs - trxMs) / 86400000);
  const isBackdated = diffDays > 0;
  const isDeepBackdated = diffDays > 1;

  if (isBackdated && (!backdateReason || backdateReason.trim() === "")) {
    throw new Error("Alasan transaksi susulan wajib diisi.");
  }

  // 2. Validasi harga reseller & harga satuan
  const hasManualPrice = Boolean(manualPriceOverride || items.some((it: any) => it.isManualPrice));

  if (transactionType === "sale_reseller") {
    for (const item of items) {
      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new Error(`Harga reseller untuk "${item.name}" belum valid atau 0. Update harga dulu sebelum transaksi reseller.`);
      }
    }
  }

  for (const item of items) {
    if (!item.unitPrice || item.unitPrice <= 0) {
      throw new Error(`Harga satuan untuk "${item.name}" tidak boleh 0.`);
    }
  }

  // 3. Create or get customer if new
  if (!finalCustomerId && customerName) {
    const { data: newCust, error: custErr } = await supabase.from("customers").insert([{
      name: customerName,
      phone: customerPhone,
      customer_type: transactionType === "sale_reseller" ? "reseller" : "general"
    }]).select().single();
    
    if (custErr) throw new Error("Gagal membuat customer baru: " + custErr.message);
    finalCustomerId = newCust.id;
  } else if (finalCustomerId && customerPhone) {
    await supabase.from("customers").update({ phone: customerPhone }).eq("id", finalCustomerId);
  }

  // 4. Validate Cart & Allocate
  const validation = await validateCart(items);
  
  if (validation.hasInsufficientStock) {
    throw new Error("Stok tidak mencukupi untuk beberapa barang.");
  }

  // 5. Otorisasi PIN Owner untuk Jual Rugi / Susulan > 1 Hari / Harga Manual
  const requiresOwnerPin = isDeepBackdated || hasManualPrice || validation.hasMinus;
  let pinVerified = false;

  if (requiresOwnerPin) {
    if (!overrideFlag) {
      if (validation.hasMinus) {
        throw new Error("Ada barang yang dijual di bawah modal. Otorisasi PIN Owner diperlukan.");
      } else if (isDeepBackdated) {
        throw new Error("Transaksi susulan mundur lebih dari 1 hari memerlukan otorisasi PIN Owner.");
      } else if (hasManualPrice) {
        throw new Error("Penggunaan harga manual pada tanggal ini memerlukan otorisasi PIN Owner.");
      }
    }

    if (!ownerPin || ownerPin.trim() === "") {
      throw new Error("PIN Owner wajib diisi untuk otorisasi.");
    }

    const pinCheck = await verifyOwnerPin(ownerPin);
    if (!pinCheck.valid) {
      throw new Error(pinCheck.error || "PIN Owner salah. Otorisasi transaksi ditolak.");
    }
    pinVerified = true;
  }

  // 6. Buat Catatan Audit
  const auditTags: string[] = [];
  if (isBackdated) {
    auditTags.push(`[TRANSAKSI SUSULAN: ${backdateReason.trim()}]`);
  }
  if (hasManualPrice) {
    auditTags.push(`[HARGA MANUAL: Diotorisasi Owner]`);
  }
  if (validation.hasMinus) {
    auditTags.push(`[OVERRIDE JUAL RUGI: Disetujui dengan PIN]`);
  } else if (pinVerified) {
    auditTags.push(`[OTORISASI OWNER: Disetujui dengan PIN]`);
  }

  const auditNotesStr = auditTags.join(" ");
  const finalNotes = notes 
    ? (auditNotesStr ? `${notes} ${auditNotesStr}` : notes)
    : (auditNotesStr || null);

  const { data: settings } = await supabase.from("settings").select("invoice_prefix").limit(1);
  const prefix = settings && settings.length > 0 ? (settings[0].invoice_prefix || "INV") : "INV";

  // 7. Create Transaction
  const dateStr = trxDate.replace(/-/g, ""); // YYYYMMDD based on transaction date
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const trxNumber = `${prefix}-${dateStr}-${randomStr}`;
  
  const totalAmount = items.reduce((acc: number, curr: any) => acc + (curr.qty * curr.unitPrice), 0);
  const remainingAmount = totalAmount - amountPaid;

  const primaryTrxPayload: any = {
    transaction_number: trxNumber,
    transaction_type: transactionType,
    customer_id: finalCustomerId,
    transaction_date: trxDate,
    total_amount: totalAmount,
    amount_paid: amountPaid,
    remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
    payment_method: paymentMethod || "cash",
    status: "final",
    notes: finalNotes,
    is_backdated: isBackdated,
    backdate_reason: isBackdated ? backdateReason.trim() : null,
    price_source_date: priceSourceDate || (hasManualPrice ? null : trxDate),
    manual_price_override: hasManualPrice
  };

  let { data: trx, error: trxErr } = await supabase
    .from("transactions")
    .insert([primaryTrxPayload])
    .select()
    .single();

  // Fallback jika migrasi SQL kolom baru belum dijalankan di Supabase
  if (trxErr && trxErr.code === "42703") {
    const fallbackPayload = {
      transaction_number: trxNumber,
      transaction_type: transactionType,
      customer_id: finalCustomerId,
      transaction_date: trxDate,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
      payment_method: paymentMethod || "cash",
      status: "final",
      notes: finalNotes
    };
    const fallbackRes = await supabase.from("transactions").insert([fallbackPayload]).select().single();
    if (fallbackRes.error) throw new Error("Gagal membuat transaksi: " + fallbackRes.error.message);
    trx = fallbackRes.data;
  } else if (trxErr) {
    throw new Error("Gagal membuat transaksi: " + trxErr.message);
  }

  // 8. Create Transaction Items and Deduct Stock
  for (const item of items) {
    const allocItem = validation.validations.find(v => v.productId === item.productId);
    if (!allocItem) continue;

    for (const alloc of allocItem.allocated) {
      // Deduct stock
      const { data: batch } = await supabase.from("stock_batches").select("quantity_remaining, cost_price, status").eq("id", alloc.batch_id).single();
      if (batch) {
        const newQty = batch.quantity_remaining - alloc.quantity;
        // Pertahankan status hold jika modal masih lebih tinggi dari harga jual retail
        let nextStatus = "ready";
        if (newQty === 0) {
          nextStatus = "sold_out";
        } else if (batch.cost_price > item.unitPrice) {
          nextStatus = "hold";
        }

        await supabase.from("stock_batches").update({
          quantity_remaining: newQty,
          status: nextStatus
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
  revalidatePath("/laporan");
  revalidatePath("/riwayat");
  
  return { success: true, transactionId: trx.id, error: undefined };
}
