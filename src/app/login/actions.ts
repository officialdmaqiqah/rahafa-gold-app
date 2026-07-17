"use server";

import { normalizeWhatsappNumber, createSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const whatsapp = formData.get("whatsapp") as string;
    const pin = formData.get("pin") as string;

    if (!whatsapp || !pin) {
      return { error: "Nomor WhatsApp dan PIN harus diisi" };
    }

    const normalizedNumber = normalizeWhatsappNumber(whatsapp);

    // 1. Fetch user from DB
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, pin_hash, role, is_active")
      .eq("whatsapp_number_normalized", normalizedNumber)
      .single();

    if (error) {
      return { error: `DB Error: ${error.message}` };
    }
    
    if (!user) {
      return { error: `User tidak ditemukan (Nomor: ${normalizedNumber})` };
    }

    if (!user.is_active) {
      return { error: "Akun Anda tidak aktif" };
    }

    // 2. Verify PIN
    const isValid = await bcrypt.compare(pin, user.pin_hash);

    if (!isValid) {
      return { error: "PIN salah" };
    }

    // 3. Create Session
    await createSession(user.id, user.role);

    // 4. Update last_login_at
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

  } catch (err: any) {
    console.error("Login Action Fatal Error:", err);
    return { error: `System Error: ${err.message}` };
  }
  
  // Redirect must be OUTSIDE try-catch block to work properly in Next.js Server Actions
  redirect("/");
}
