import { KasClient } from "./kas-client";
import { getCashTransactions } from "./actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KasPage() {
  const transactions = await getCashTransactions();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Buku Kas & Biaya</h2>
          <p className="text-muted-foreground mt-1">
            Catat arus kas masuk dan keluar di luar transaksi jual/beli.
          </p>
        </div>
      </div>
      
      <KasClient initialData={transactions} />
    </div>
  );
}
