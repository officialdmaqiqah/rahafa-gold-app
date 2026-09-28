"use server";

import { normalizeWhatsappNumber, createSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const rawIdentifier = (formData.get("identifier") || formData.get("whatsapp")) as string;
    const pin = formData.get("pin") as string;

    if (!rawIdentifier || !pin) {
      return { error: "Username/Nomor WhatsApp dan PIN harus diisi" };
    }

    const identifier = rawIdentifier.trim();
    let user: any = null;

    // Check if input is username (contains letters or matches owner/admin aliases)
    const isUsername = /[a-zA-Z]/.test(identifier);

    if (isUsername) {
      const lower = identifier.toLowerCase();

      // 1. First try query by LOWER(username)
      const { data: userByUsername } = await supabase
        .from("users")
        .select("id, name, pin_hash, role, is_active, whatsapp_number_normalized")
        .ilike("username", lower)
        .maybeSingle();

      if (userByUsername) {
        user = userByUsername;
      } else {
        // Fallback for standard aliases if username column is null or not yet migrated
        if (lower === "owner") {
          const { data: ownerUser } = await supabase
            .from("users")
            .select("id, name, pin_hash, role, is_active, whatsapp_number_normalized")
            .eq("whatsapp_number_normalized", "6282372078677")
            .maybeSingle();
          if (ownerUser) user = ownerUser;
        } else if (lower === "admin") {
          const { data: adminUser } = await supabase
            .from("users")
            .select("id, name, pin_hash, role, is_active, whatsapp_number_normalized")
            .or("whatsapp_number_normalized.eq.6285188071133,whatsapp_number_normalized.eq.admin")
            .maybeSingle();
          if (adminUser) user = adminUser;
        }
      }
    } else {
      // 2. Input is a phone number (e.g. 0823-7207-8677, 085188071133, +6282372078677)
      const normalizedNumber = normalizeWhatsappNumber(identifier);

      const { data: userByPhone, error } = await supabase
        .from("users")
        .select("id, name, pin_hash, role, is_active")
        .eq("whatsapp_number_normalized", normalizedNumber)
        .maybeSingle();

      if (error && (error.message?.includes("fetch failed") || error.message?.includes("ENOTFOUND"))) {
        return { error: "Gagal terhubung ke server database Supabase. Silakan periksa koneksi Anda." };
      }

      if (userByPhone) {
        user = userByPhone;
      }
    }
    
    if (!user) {
      return { error: "Username/Nomor WhatsApp atau PIN salah" };
    }

    if (!user.is_active) {
      return { error: "Akun Anda tidak aktif" };
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, user.pin_hash);

    if (!isValid) {
      return { error: "Username/Nomor WhatsApp atau PIN salah" };
    }

    // Create Session
    await createSession(user.id, user.role);

    // Update last_login_at
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Login Action Fatal Error:", err);
    return { error: "Username/Nomor WhatsApp atau PIN salah" };
  }
  
  // Redirect must be OUTSIDE try-catch block to work properly in Next.js Server Actions
  redirect("/dashboard");
}
