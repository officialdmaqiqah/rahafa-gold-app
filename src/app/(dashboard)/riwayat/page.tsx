import { RiwayatClient } from "@/components/riwayat/riwayat-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RiwayatPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Riwayat Transaksi</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Lihat histori penjualan, barang masuk, dan buyback. Batalkan (Void) jika terjadi kesalahan.
          </p>
        </div>
      </div>
      
      <RiwayatClient />
    </div>
  );
}
