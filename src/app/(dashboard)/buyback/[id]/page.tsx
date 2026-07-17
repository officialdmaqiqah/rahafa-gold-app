import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { BuybackPrintClient } from "@/components/buyback/buyback-print-client";

export const dynamic = 'force-dynamic';

export default async function BuybackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(`
      *,
      customers (*),
      transaction_items (
        *,
        products (*)
      )
    `)
    .eq("id", resolvedParams.id)
    .single();

  if (error || !transaction || transaction.transaction_type !== 'buyback') {
    return notFound();
  }

  const { data: settingsData } = await supabase.from("settings").select("*").limit(1);
  const settings = settingsData && settingsData.length > 0 ? settingsData[0] : null;

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 min-h-screen bg-slate-50">
      <BuybackPrintClient transaction={transaction} settings={settings} />
    </div>
  );
}
