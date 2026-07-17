import { getProducts } from "./actions";
import { ProductFormDialog } from "@/components/produk/product-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';
  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : 'all';

  const products = await getProducts(search, category, type);

  // Get unique types for filter
  const types = Array.from(new Set(products.map(p => p.type).filter(Boolean)));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Produk</h1>
          <p className="text-muted-foreground">Kelola master data produk Anda (Emas & Perak).</p>
        </div>
        <ProductFormDialog />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Cari kode, nama..."
              className="pl-8"
              defaultValue={search}
            />
          </div>
          {category !== 'all' && <input type="hidden" name="category" value={category} />}
          {type !== 'all' && <input type="hidden" name="type" value={type} />}
          <button type="submit" className="hidden" />
        </form>

        <form className="flex gap-2">
          {search && <input type="hidden" name="q" value={search} />}
          <Select name="category" defaultValue={category} items={[{value:'all',label:'Semua Kategori'},{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="gold">Emas</SelectItem>
              <SelectItem value="silver">Perak</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="secondary">Filter</Button>
        </form>
      </div>

      <div className="rounded-lg border shadow-sm overflow-x-auto overflow-hidden">
        <Table>
          <TableHeader className="bg-[#294376] hover:bg-[#294376]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white font-semibold">Kode Barang</TableHead>
              <TableHead className="text-white font-semibold">Nama Produk</TableHead>
              <TableHead className="text-white font-semibold">Kategori</TableHead>
              <TableHead className="text-white font-semibold">Model</TableHead>
              <TableHead className="text-white font-semibold">Berat</TableHead>
              <TableHead className="text-white font-semibold">Status</TableHead>
              <TableHead className="text-white font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Tidak ada data produk ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.item_code}
                    <div className="text-xs text-muted-foreground">{product.system_code}</div>
                  </TableCell>
                  <TableCell className="capitalize">{product.name.toLowerCase()}</TableCell>
                  <TableCell>
                    <Badge variant={product.category === 'gold' ? 'default' : 'secondary'}>
                      {product.category === 'gold' ? 'Emas' : 'Perak'}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{product.type?.toLowerCase()}</TableCell>
                  <TableCell>{product.weight} {product.unit}</TableCell>
                  <TableCell>
                    {product.is_active ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductFormDialog product={product} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
