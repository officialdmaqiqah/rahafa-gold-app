import { getDailyPrices } from "./actions";
import { DailyPricesClient } from "@/components/harga-harian/daily-prices-client";
import { redirect } from "next/navigation";

export default async function HargaHarianPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const dateParam = typeof resolvedParams.date === 'string' ? resolvedParams.date : undefined;
  
  // Default to today if no date provided
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time ideally, but CA is a good fallback
  const date = dateParam || today;

  if (!dateParam) {
    redirect(`/harga-harian?date=${today}`);
  }

  const search = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';

  const result = await getDailyPrices(date);
  let filteredData = result.data;

  if (category && category !== 'all') {
    filteredData = filteredData.filter((d: any) => d.product.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filteredData = filteredData.filter((d: any) => 
      d.product.name.toLowerCase().includes(q) || 
      d.product.item_code.toLowerCase().includes(q) ||
      d.product.type.toLowerCase().includes(q)
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Harga Hari Ini</h1>
        <p className="text-muted-foreground">Kelola harga harian.</p>
      </div>

      <DailyPricesClient 
        date={date} 
        data={filteredData} 
        search={search}
        category={category}
        allCount={result.data.length}
        sessionName={result.sessionName || undefined}
        status={result.status || undefined}
      />
    </div>
  );
}
