import { BuybackClient } from "@/components/buyback/buyback-client";
import { getBuybackData } from "./actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BuybackPage() {
  const { products, customers } = await getBuybackData();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Buyback / Pembelian</h2>
          <p className="text-muted-foreground mt-1">
            Terima dan beli kembali emas/perak dari pelanggan.
          </p>
        </div>
      </div>
      
      <BuybackClient products={products} customers={customers} />
    </div>
  );
}
