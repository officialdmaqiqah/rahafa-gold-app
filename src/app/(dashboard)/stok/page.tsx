import { getStockData } from "./actions";
import { StockDetailCard } from "@/components/stok/stock-detail-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default async function StokAkhirPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';

  const data = await getStockData(search, category);

  // We will need server actions for search and category via form GET
  // Actually, we can use standard form submission for Server Components
  async function searchAction(formData: FormData) {
    "use server";
    const q = formData.get("q") as string;
    const cat = formData.get("category") as string;
    
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "all") params.set("category", cat);
    
    redirect("/stok?" + params.toString());
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Stok Akhir</h1>
        <p className="text-muted-foreground mt-2">
          Pantau sisa stok dan margin per produk.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form action={searchAction} className="flex-1 flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              name="q"
              placeholder="Cari produk..."
              className="pl-10 h-11 border-none shadow-none focus-visible:ring-0 bg-transparent text-base"
              defaultValue={search}
            />
          </div>
          <div className="w-[150px] md:w-[200px] border-l border-slate-100 pl-3">
            <Select name="category" defaultValue={category} items={[{value:'all',label:'Semua Kategori'},{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>
              <SelectTrigger className="h-11 border-none shadow-none focus:ring-0 bg-transparent">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="gold">Emas</SelectItem>
                <SelectItem value="silver">Perak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="h-11 px-6 rounded-xl bg-[#294376] text-white hover:bg-[#1a2d54] transition-colors">Cari</Button>
        </form>
      </div>

      {data.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 rounded-2xl text-muted-foreground bg-slate-50">
          Tidak ada stok produk yang ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {/* @ts-ignore */}
          <Accordion className="w-full space-y-4" type="multiple">
            {data.map((item) => (
              <AccordionItem key={item.product.id} value={item.product.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm px-4 overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex flex-1 items-center justify-between mr-4 text-left">
                    <div>
                      <div className="font-bold text-lg text-slate-800">{item.product.name}</div>
                      <div className="text-sm font-medium text-slate-400 mt-1">{item.product.item_code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl text-slate-800 tracking-tight">{item.totalStock} <span className="text-sm font-medium text-slate-500">pcs</span></div>
                      <Badge variant={item.product.category === 'gold' ? 'default' : 'secondary'} className={`mt-2 ${item.product.category === 'gold' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-slate-100 text-slate-700 shadow-none border-none'}`}>
                        {item.product.category === 'gold' ? 'Emas' : 'Perak'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Detail Modal Stok</h4>
                    {item.batches.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Tidak ada detail stok.</p>
                    ) : (
                      item.batches.map((batch: any) => (
                        <StockDetailCard 
                          key={batch.id} 
                          batch={batch} 
                          activePrice={item.activePrice} 
                          minMargin={item.minMargin} 
                          minMarginPercent={item.minMarginPercent}
                        />
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
