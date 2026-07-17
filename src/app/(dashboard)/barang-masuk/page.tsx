import { getActiveProducts } from "./actions";
import { StockInForm } from "@/components/barang-masuk/stock-in-form";

export default async function BarangMasukPage() {
  const products = await getActiveProducts();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Barang Masuk</h1>
        <p className="text-muted-foreground mt-2">
          Catat penerimaan stok baru, penyesuaian, atau stok awal ke dalam sistem.
        </p>
      </div>

      <StockInForm products={products} />
    </div>
  );
}
