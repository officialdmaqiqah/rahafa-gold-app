"use server";

import { supabase } from "@/lib/supabase";

export async function getPriceHistory(limit = 100) {
  // Fetch a raw list of prices to deduce sessions
  // We don't need all columns, just the grouping ones
  const { data, error } = await supabase
    .from("daily_prices")
    .select("date, session_name, status, created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Group by date and session_name
  const sessionsMap = new Map<string, any>();

  (data || []).forEach(row => {
    const key = `${row.date}_${row.session_name}`;
    if (!sessionsMap.has(key)) {
      sessionsMap.set(key, {
        date: row.date,
        session_name: row.session_name || "Sesi 1",
        status: row.status,
        created_at: row.created_at,
      });
    }
  });

  // Convert to array and sort
  const sessions = Array.from(sessionsMap.values());
  sessions.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sessions.slice(0, limit);
}
