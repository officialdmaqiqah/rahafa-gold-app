import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { InvoicePrintClient } from "@/components/invoice/invoice-print-client";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: transaction, error: tErr } = await supabase
    .from("transactions")
    .select(`
      *,
      customer:customers(name, phone, address, customer_type)
    `)
    .eq("id", id)
    .single();

  if (tErr || !transaction) {
    return notFound();
  }

  const { data: items, error: iErr } = await supabase
    .from("transaction_items")
    .select(`
      *,
      product:products(name, item_code, weight, unit, type, category)
    `)
    .eq("transaction_id", id);

  if (iErr) {
    console.error("Error fetching items:", iErr);
  }

  // Aggregate items if they have the same product_id and unit_price (since they might be split by stock_batch)
  const aggregatedItemsMap = new Map();
  items?.forEach((item: any) => {
    const key = `${item.product_id}_${item.unit_price}`;
    if (aggregatedItemsMap.has(key)) {
      const existing = aggregatedItemsMap.get(key);
      existing.quantity += item.quantity;
    } else {
      aggregatedItemsMap.set(key, { ...item });
    }
  });

  const aggregatedItems = Array.from(aggregatedItemsMap.values());

  const { data: settingsData } = await supabase.from("settings").select("*").limit(1);
  const settings = settingsData && settingsData.length > 0 ? settingsData[0] : null;

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8 flex justify-center">
      <InvoicePrintClient transaction={transaction} items={aggregatedItems} settings={settings} />
    </div>
  );
}
