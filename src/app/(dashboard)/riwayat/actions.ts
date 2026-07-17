"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getTransactionHistory(limit = 100) {
  // 1. Ambil data Transaksi (Penjualan & Buyback)
  const { data: transactions, error: trxErr } = await supabase
    .from("transactions")
    .select(`
      id,
      transaction_number,
      transaction_type,
      transaction_date,
      total_amount,
      status,
      created_at,
      customers (name),
      transaction_items (
        quantity,
        unit_price,
        products (name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (trxErr) throw new Error(trxErr.message);

  // 2. Ambil data Barang Masuk (dari stock_batches yang bukan buyback)
  // Karena buyback sudah masuk ke tabel transactions
  const { data: stockIns, error: stockErr } = await supabase
    .from("stock_batches")
    .select(`
      id,
      date_in,
      source_type,
      quantity_in,
      quantity_remaining,
      cost_price,
      supplier_name,
      status,
      created_at,
      products (name)
    `)
    .in("source_type", ["supplier", "initial"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (stockErr) throw new Error(stockErr.message);

  // 3. Gabungkan dan Format Data
  const history: any[] = [];

  transactions.forEach((trx: any) => {
    let itemsStr = "";
    if (trx.transaction_items) {
      itemsStr = trx.transaction_items.map((i: any) => `${i.products?.name} (${i.quantity}x)`).join(", ");
    }
    
    history.push({
      id: trx.id,
      type: trx.transaction_type, // 'sale_general', 'sale_reseller', 'buyback'
      date: trx.transaction_date,
      created_at: trx.created_at,
      title: trx.transaction_number,
      description: `Pelanggan: ${trx.customers?.name || "Umum"} | Items: ${itemsStr}`,
      amount: trx.total_amount,
      status: trx.status, // 'final', 'cancelled'
      raw: trx
    });
  });

  stockIns.forEach((st: any) => {
    history.push({
      id: st.id,
      type: "stock_in",
      date: st.date_in,
      created_at: st.created_at,
      title: `Barang Masuk (${st.source_type})`,
      description: `Produk: ${st.products?.name} | Qty: ${st.quantity_in} | Sisa Stok: ${st.quantity_remaining} | Supplier: ${st.supplier_name || "-"}`,
      amount: st.quantity_in * st.cost_price,
      status: st.status === "cancelled" ? "cancelled" : "final",
      raw: st
    });
  });

  // Urutkan berdasarkan created_at terbaru
  history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return history.slice(0, limit);
}

export async function voidTransaction(id: string, type: string) {
  try {
    if (type === "stock_in") {
      // Pembatalan Barang Masuk
      // Validasi: Pastikan quantity_remaining == quantity_in (belum ada yang terjual)
      const { data: batch, error: batchErr } = await supabase
        .from("stock_batches")
        .select("quantity_in, quantity_remaining")
        .eq("id", id)
        .single();
        
      if (batchErr) throw new Error("Gagal mengambil data batch: " + batchErr.message);
      
      if (batch.quantity_remaining < batch.quantity_in) {
        throw new Error("Tidak bisa membatalkan barang masuk ini karena sebagian stoknya sudah terjual. Silakan batalkan Invoice penjualannya terlebih dahulu.");
      }

      // Void (Set status = cancelled, quantity_remaining = 0)
      const { error: updErr } = await supabase
        .from("stock_batches")
        .update({ 
          status: "cancelled", 
          quantity_remaining: 0,
          notes: "VOID / Dibatalkan"
        })
        .eq("id", id);
        
      if (updErr) throw new Error(updErr.message);

    } else if (type === "sale_general" || type === "sale_reseller") {
      // Pembatalan Penjualan (Invoice)
      // 1. Cek status saat ini
      const { data: trx, error: trxErr } = await supabase
        .from("transactions")
        .select("status")
        .eq("id", id)
        .single();
        
      if (trxErr) throw new Error(trxErr.message);
      if (trx.status === "cancelled") throw new Error("Transaksi sudah dibatalkan sebelumnya.");

      // 2. Ambil item-item untuk mengembalikan stok
      const { data: items, error: itemsErr } = await supabase
        .from("transaction_items")
        .select("stock_batch_id, quantity")
        .eq("transaction_id", id);
        
      if (itemsErr) throw new Error(itemsErr.message);

      // 3. Kembalikan stok
      for (const item of items) {
        if (!item.stock_batch_id) continue;
        
        // Ambil stok saat ini
        const { data: batch } = await supabase
          .from("stock_batches")
          .select("quantity_remaining")
          .eq("id", item.stock_batch_id)
          .single();
          
        if (batch) {
          const newQty = batch.quantity_remaining + item.quantity;
          await supabase
            .from("stock_batches")
            .update({
              quantity_remaining: newQty,
              status: "ready" // pasti ready karena ada isinya lagi
            })
            .eq("id", item.stock_batch_id);
        }
      }

      // 4. Ubah status invoice menjadi cancelled
      const { error: updErr } = await supabase
        .from("transactions")
        .update({ status: "cancelled", notes: "VOID / Dibatalkan" })
        .eq("id", id);
        
      if (updErr) throw new Error(updErr.message);

    } else if (type === "buyback") {
      // Pembatalan Buyback
      // Buyback membuat transaction DAN stock_batch. Kita harus validasi apakah stok dari buyback ini sudah terjual!
      
      // Ambil ID transaksi
      const { data: trx, error: trxErr } = await supabase
        .from("transactions")
        .select("status")
        .eq("id", id)
        .single();
        
      if (trxErr) throw new Error(trxErr.message);
      if (trx.status === "cancelled") throw new Error("Buyback sudah dibatalkan sebelumnya.");

      // Cek stock_batches yang berasal dari transaksi buyback ini
      const { data: batches, error: batchErr } = await supabase
        .from("stock_batches")
        .select("id, quantity_in, quantity_remaining")
        .eq("source_type", "buyback")
        .eq("source_ref_id", id);
        
      if (batchErr) throw new Error(batchErr.message);

      // Validasi semua batch
      for (const batch of batches) {
        if (batch.quantity_remaining < batch.quantity_in) {
          throw new Error("Tidak bisa membatalkan buyback ini karena stok emasnya sudah terjual kembali. Batalkan invoice penjualannya terlebih dahulu.");
        }
      }

      // Jika aman, Void semua batch
      for (const batch of batches) {
        await supabase
          .from("stock_batches")
          .update({
            status: "cancelled",
            quantity_remaining: 0,
            notes: "VOID / Dibatalkan"
          })
          .eq("id", batch.id);
      }

      // Ubah status transaksi
      const { error: updErr } = await supabase
        .from("transactions")
        .update({ status: "cancelled", notes: "VOID / Dibatalkan" })
        .eq("id", id);
        
      if (updErr) throw new Error(updErr.message);
    }

    revalidatePath("/laporan");
    revalidatePath("/riwayat");
    revalidatePath("/stok");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
