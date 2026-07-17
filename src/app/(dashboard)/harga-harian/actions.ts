"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getDailyPrices(date: string) {
  // Get all active products
  const { data: products, error: pError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("item_code", { ascending: true });

  if (pError) throw new Error(pError.message);

  const { data: prices, error: prError } = await supabase
    .from("daily_prices")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false });

  if (prError) throw new Error(prError.message);

  let targetSessionName: string | null = null;
  let targetStatus: string | null = null;
  
  const draftPrices = prices.filter((p: any) => p.status === 'draft');
  const activePrices = prices.filter((p: any) => p.status === 'active');
  
  let selectedPrices: any[] = [];
  if (draftPrices.length > 0) {
    selectedPrices = draftPrices;
    targetSessionName = draftPrices[0].session_name;
    targetStatus = 'draft';
  } else if (activePrices.length > 0) {
    selectedPrices = activePrices;
    targetSessionName = activePrices[0].session_name;
    targetStatus = 'active';
  } else {
    const archivedPrices = prices.filter((p: any) => p.status === 'archived');
    if (archivedPrices.length > 0) {
      targetSessionName = archivedPrices[0].session_name;
      targetStatus = 'archived';
      selectedPrices = prices.filter((p: any) => p.session_name === targetSessionName);
    }
  }

  const priceMap = new Map();
  selectedPrices.forEach((p: any) => priceMap.set(p.product_id, p));

  return {
    sessionName: targetSessionName,
    status: targetStatus,
    data: products.map(prod => ({
      product: prod,
      price: priceMap.get(prod.id) || null
    }))
  };
}

export async function saveDailyPricesDraft(date: string, payload: any[]) {
  // First, find existing draft for this date.
  const { data: existingDrafts } = await supabase
    .from("daily_prices")
    .select("id, product_id, session_name")
    .eq("date", date)
    .eq("status", "draft");

  // Determine session_name
  let sessionName = "Sesi 1";
  if (existingDrafts && existingDrafts.length > 0) {
    sessionName = existingDrafts[0].session_name || "Sesi 1";
  } else {
    // Generate new session name based on active/archived count for this date
    const { data: allSessions } = await supabase
      .from("daily_prices")
      .select("session_name")
      .eq("date", date);
    
    const uniqueSessions = new Set((allSessions || []).map(s => s.session_name).filter(Boolean));
    sessionName = `Sesi ${uniqueSessions.size + 1}`;
  }

  const upsertData = payload.map(item => ({
    product_id: item.product_id,
    date: date,
    retail_sell_price: item.retail_sell_price,
    reseller_sell_price: item.reseller_sell_price || null,
    buyback_price: item.buyback_price || null,
    status: "draft",
    session_name: sessionName
  }));

  const existingMap = new Map(existingDrafts?.map(e => [e.product_id, e.id]) || []);

  const toInsert = [];
  const toUpdate = [];

  for (const item of upsertData) {
    const id = existingMap.get(item.product_id);
    if (id) {
      toUpdate.push({ id, ...item });
    } else {
      toInsert.push(item);
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("daily_prices").insert(toInsert);
    if (error) throw new Error("Gagal menyimpan insert: " + error.message);
  }

  if (toUpdate.length > 0) {
    const { error } = await supabase.from("daily_prices").upsert(toUpdate);
    if (error) throw new Error("Gagal menyimpan update: " + error.message);
  }

  revalidatePath("/harga-harian");
  return { success: true, error: undefined };
}

export async function activateDailyPrices(date: string) {
  // Find all currently 'active' prices for this date
  const { data: activePrices } = await supabase
    .from("daily_prices")
    .select("id")
    .eq("date", date)
    .eq("status", "active");

  if (activePrices && activePrices.length > 0) {
    // Archive them
    const activeIds = activePrices.map(p => p.id);
    const { error: archErr } = await supabase
      .from("daily_prices")
      .update({ status: "archived" })
      .in("id", activeIds);
      
    if (archErr) throw new Error("Gagal mengarsipkan sesi lama: " + archErr.message);
  }

  // Then activate the 'draft'
  const { error } = await supabase
    .from("daily_prices")
    .update({ status: "active" })
    .eq("date", date)
    .eq("status", "draft");

  if (error) throw new Error("Gagal mengaktifkan harga baru: " + error.message);
  
  revalidatePath("/harga-harian");
  return { success: true, error: undefined };
}

export async function copyPreviousPrices(targetDate: string) {
  const { data: previous, error: err } = await supabase
    .from("daily_prices")
    .select("date")
    .lt("date", targetDate)
    .eq("status", "active")
    .order("date", { ascending: false })
    .limit(1);

  if (err) throw new Error(err.message);
  if (!previous || previous.length === 0) {
    return { error: "Tidak ada harga aktif di hari sebelumnya." };
  }

  const prevDate = previous[0].date;

  const { data: prevPrices, error: prevErr } = await supabase
    .from("daily_prices")
    .select("*")
    .eq("date", prevDate)
    .eq("status", "active");

  if (prevErr) throw new Error(prevErr.message);

  if (!prevPrices || prevPrices.length === 0) {
    return { error: "Data harga sebelumnya kosong." };
  }

  // Delete existing drafts for the targetDate
  await supabase
    .from("daily_prices")
    .delete()
    .eq("date", targetDate)
    .eq("status", "draft");

  // Generate new session name based on active/archived count for this date
  const { data: allSessions } = await supabase
    .from("daily_prices")
    .select("session_name")
    .eq("date", targetDate);
  
  const uniqueSessions = new Set((allSessions || []).map(s => s.session_name).filter(Boolean));
  const sessionName = `Sesi ${uniqueSessions.size + 1}`;

  const newDrafts = prevPrices.map((p: any) => ({
    product_id: p.product_id,
    date: targetDate,
    retail_sell_price: p.retail_sell_price,
    reseller_sell_price: p.reseller_sell_price,
    buyback_price: p.buyback_price,
    status: "draft",
    session_name: sessionName
  }));

  const { error: insErr } = await supabase.from("daily_prices").insert(newDrafts);
  if (insErr) throw new Error(insErr.message);

  revalidatePath("/harga-harian");
  return { success: true, fromDate: prevDate };
}
