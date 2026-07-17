"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addStockIn(prevState: any, formData: FormData) {
  try {
    const itemsJson = formData.get("items") as string;
    const dateIn = formData.get("date_in") as string;
    const sourceType = formData.get("source_type") as string;
    const supplierName = formData.get("supplier_name") as string;
    const notes = formData.get("notes") as string;

    if (!itemsJson) throw new Error("Data produk tidak ditemukan");
    if (!dateIn) throw new Error("Tanggal masuk wajib diisi");

    let items = [];
    try {
      items = JSON.parse(itemsJson);
    } catch (e) {
      throw new Error("Format data produk tidak valid");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Minimal satu produk harus ditambahkan");
    }

    const payload = items.map((item: any, index: number) => {
      const productId = item.product_id;
      if (!productId) throw new Error(`Produk pada baris ${index + 1} wajib dipilih`);

      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity <= 0) throw new Error(`Qty pada baris ${index + 1} wajib lebih dari 0`);

      const costPriceStr = String(item.cost_price || "0").replace(/\D/g, "");
      const costPrice = parseInt(costPriceStr);
      if (isNaN(costPrice) || costPrice <= 0) throw new Error(`Harga modal pada baris ${index + 1} wajib lebih dari 0`);

      return {
        product_id: productId,
        source_type: sourceType,
        date_in: dateIn,
        quantity_in: quantity,
        quantity_remaining: quantity,
        cost_price: costPrice,
        supplier_name: supplierName || null,
        notes: notes || null,
        status: "ready"
      };
    });

    const { error } = await supabase.from("stock_batches").insert(payload);

    if (error) {
      throw new Error(`Gagal menyimpan stok: ${error.message}`);
    }

    revalidatePath("/stok");
    return { success: true, message: `${payload.length} produk berhasil ditambahkan!` };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getActiveProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, item_code, type, weight, unit")
    .eq("is_active", true)
    .order("name", { ascending: true });
    
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}
