"use server";

import { supabase } from "@/lib/supabase";
import { verifySession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").limit(1).single();
  
  if (error && error.code === 'PGRST116') {
    // If no settings exist, create a default one
    const defaultSettings = {
      store_name: "RAHAFA",
      tagline: "EMAS & SILVER",
      phone: "0853-8410-9496",
      invoice_prefix: "INV",
      buyback_prefix: "BB",
      minimum_margin_amount: 0,
      minimum_margin_percent: 0
    };
    
    const { data: newSettings, error: insertError } = await supabase
      .from("settings")
      .insert(defaultSettings)
      .select()
      .single();
      
    if (insertError) return { error: insertError.message };
    return newSettings;
  }
  
  return data;
}

export async function updateSettings(formData: FormData) {
  const session = await verifySession();
  if (session?.role !== "owner" && session?.role !== "admin") {
    return { error: "Hanya Admin/Owner yang dapat mengubah pengaturan" };
  }

  const id = formData.get("id") as string;
  const store_name = formData.get("store_name") as string;
  const tagline = formData.get("tagline") as string;
  const phone = formData.get("phone") as string;
  const invoice_prefix = formData.get("invoice_prefix") as string;
  const buyback_prefix = formData.get("buyback_prefix") as string;
  const invoice_footer = formData.get("invoice_footer") as string;
  const bank_account_info = formData.get("bank_account_info") as string;
  const minimum_margin_amount = parseFloat(formData.get("minimum_margin_amount") as string || "0");
  const minimum_margin_percent = parseFloat(formData.get("minimum_margin_percent") as string || "0");
  
  const pin = formData.get("pin") as string;

  const updates: any = {
    store_name,
    tagline,
    phone,
    invoice_prefix,
    buyback_prefix,
    invoice_footer,
    bank_account_info,
    minimum_margin_amount,
    minimum_margin_percent,
    updated_at: new Date().toISOString()
  };

  if (pin && pin.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updates.owner_override_pin_hash = await bcrypt.hash(pin, salt);
  }

  const { error } = await supabase.from("settings").update(updates).eq("id", id);
  if (error) return { error: error.message };

  return { success: true };
}

export async function uploadLogo(formData: FormData) {
  const session = await verifySession();
  if (session?.role !== "owner" && session?.role !== "admin") {
    return { error: "Akses ditolak" };
  }

  const file = formData.get("logo") as File;
  if (!file) return { error: "File tidak ditemukan" };

  const id = formData.get("id") as string;
  
  // 1. Ensure bucket exists (or try to create it)
  // We use the admin/service_role client implicitly here if we configured it, otherwise it might fail.
  const bucketName = "store_assets";
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.find((b) => b.name === bucketName);

  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
    // if it fails due to RLS, it might be that the user has to create it manually, but we try anyway.
    if (createError && createError.message !== 'Bucket already exists') {
      console.warn("Could not create bucket automatically:", createError);
    }
  }

  // 2. Upload the file
  const fileExt = file.name.split('.').pop();
  const fileName = `logo_${Date.now()}.${fileExt}`;
  
  // We convert the file to arrayBuffer for supabase js upload
  const arrayBuffer = await file.arrayBuffer();
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: true
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // 3. Get public URL
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  
  if (publicUrlData) {
    // 4. Update settings
    const { error: updateError } = await supabase.from("settings").update({ logo_url: publicUrlData.publicUrl }).eq("id", id);
    if (updateError) return { error: updateError.message };
    
    return { success: true, url: publicUrlData.publicUrl };
  }

  return { error: "Gagal mendapatkan URL publik" };
}
