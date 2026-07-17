import { LaporanClient } from "@/components/laporan/laporan-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LaporanPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Laporan & Valuasi</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Rekapitulasi penjualan, buyback, dan nilai inventaris.
          </p>
        </div>
      </div>
      
      <LaporanClient />
    </div>
  );
}
