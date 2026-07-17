"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getCashTransactions() {
  const { data, error } = await supabase
    .from("cash_transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cash_transactions:", error);
    return [];
  }

  return data;
}

export async function addCashTransaction(payload: {
  date: string;
  type: "IN" | "OUT";
  category: string;
  amount: number;
  description: string;
}) {
  const { error } = await supabase.from("cash_transactions").insert([{
    date: payload.date,
    type: payload.type,
    category: payload.category,
    amount: payload.amount,
    description: payload.description,
  }]);

  if (error) {
    console.error("Error adding cash transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/kas");
  revalidatePath("/laporan");
  
  return { success: true };
}

export async function deleteCashTransaction(id: string) {
  const { error } = await supabase.from("cash_transactions").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/kas");
  revalidatePath("/laporan");
  
  return { success: true };
}
