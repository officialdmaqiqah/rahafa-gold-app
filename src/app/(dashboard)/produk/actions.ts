"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getProducts(search?: string, category?: string, type?: string) {
  let query = supabase
    .from("products")
    .select("*")
    .order("item_code", { ascending: true });

  if (search) {
    query = query.or(`item_code.ilike.%${search}%,system_code.ilike.%${search}%,name.ilike.%${search}%,type.ilike.%${search}%`);
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data;
}

function toTitleCase(str: string) {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export async function upsertProduct(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string | null;
    const itemCode = formData.get("item_code") as string;
    const systemCode = formData.get("system_code") as string;
    const name = toTitleCase(formData.get("name") as string);
    const category = formData.get("category") as string;
    const type = toTitleCase(formData.get("type") as string);
    const weight = parseFloat(formData.get("weight") as string);
    const unit = formData.get("unit") as string;

    const payload = {
      item_code: itemCode,
      system_code: systemCode,
      name,
      category,
      type,
      weight,
      unit,
      is_active: true
    };

    let error;

    if (id) {
      // Update
      const { error: err } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id);
      error = err;
    } else {
      // Insert
      const { error: err } = await supabase
        .from("products")
        .insert([payload]);
      error = err;
    }

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { error: "Kode Barang atau Kode Sistem sudah digunakan." };
      }
      return { error: `Gagal menyimpan produk: ${error.message}` };
    }

    revalidatePath("/produk");
    return { success: true };
  } catch (err: any) {
    return { error: `Terjadi kesalahan: ${err.message}` };
  }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: !currentStatus })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/produk");
  return { success: true };
}
