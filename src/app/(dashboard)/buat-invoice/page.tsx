import { getPosData } from "./actions";
import { PosClient } from "@/components/invoice/pos-client";

export default async function BuatInvoicePage() {
  const { products, customers, hasMissingTodayPrice } = await getPosData();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Buat Invoice</h1>
        <p className="text-muted-foreground mt-2">
          Point of Sale - Catat penjualan umum dan reseller.
        </p>
      </div>

      <PosClient products={products} customers={customers} hasMissingTodayPrice={hasMissingTodayPrice} />
    </div>
  );
}
