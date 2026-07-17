"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addStockIn } from "@/app/(dashboard)/barang-masuk/actions";
import { Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";

export function StockInForm({ products }: { products: any[] }) {
  const [state, formAction, isPending] = useActionState(addStockIn, null);
  const [successMsg, setSuccessMsg] = useState("");
  
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

  // State to hold the dynamic list of products
  const [items, setItems] = useState([
    { id: crypto.randomUUID(), product_id: "", quantity: "", cost_price: "" }
  ]);

  useEffect(() => {
    if (state?.success) {
      setSuccessMsg(state.message || "Berhasil disimpan!");
      // Reset form
      setItems([{ id: crypto.randomUUID(), product_id: "", quantity: "", cost_price: "" }]);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  }, [state]);

  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), product_id: "", quantity: "", cost_price: "" }]);
  };

  const handleRemoveItem = (idToRemove: string) => {
    if (items.length === 1) return; // Prevent removing the last row
    setItems(items.filter(item => item.id !== idToRemove));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePriceChange = (id: string, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    updateItem(id, "cost_price", cleanVal);
  };

  const formatRupiah = (val: string) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(val));
  };

  const sortedProducts = [...products].sort((a,b) => (a.name||'').localeCompare(b.name||''));

  return (
    <Card className="max-w-4xl mx-auto border shadow-sm pt-0 gap-0 overflow-hidden">
      <CardHeader className="bg-[#294376] dark:bg-[#1a2d54] border-b pb-4 pt-4 m-0 rounded-t-xl">
        <CardTitle className="text-lg text-white">Form Barang Masuk</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <form action={formAction} className="space-y-8">
          
          {/* Hidden input to pass the items array to the server action */}
          <input type="hidden" name="items" value={JSON.stringify(items)} />

          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {state.error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_in">Tanggal Masuk</Label>
              <Input type="date" id="date_in" name="date_in" required defaultValue={today} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source_type">Sumber Stok</Label>
              <Select name="source_type" defaultValue="supplier" required items={[{value:'supplier',label:'Supplier'},{value:'opening_stock',label:'Stok Awal'},{value:'adjustment',label:'Penyesuaian (Koreksi)'}]}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier" label="Supplier">Supplier</SelectItem>
                  <SelectItem value="opening_stock" label="Stok Awal">Stok Awal</SelectItem>
                  <SelectItem value="adjustment" label="Penyesuaian (Koreksi)">Penyesuaian (Koreksi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_name">Nama Supplier (Opsional)</Label>
              <Input type="text" id="supplier_name" name="supplier_name" placeholder="Contoh: PT Antam / Toko Budi" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input type="text" id="notes" name="notes" placeholder="Keterangan tambahan..." />
            </div>
          </div>

          <hr className="border-border" />

          {/* Section 2: Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Daftar Produk</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="text-primary border-primary/30 hover:bg-primary/10">
                <Plus className="mr-1 h-4 w-4" /> Tambah Produk
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg border border-border/50">
                  <div className="w-full md:flex-1 flex flex-col justify-end gap-2">
                    <Label className="text-xs text-muted-foreground font-medium">Pilih Produk</Label>
                    <Select value={item.product_id} onValueChange={(val) => updateItem(item.id, "product_id", val || "")} items={sortedProducts.map(p => {
                      const titleName = p.name ? p.name.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase()) : "";
                      return {value: p.id, label: `${titleName} (${p.weight} ${p.unit}) - [Kode: ${p.item_code}]`};
                    })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Pilih Produk --" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedProducts.map(p => {
                          const titleName = p.name ? p.name.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase()) : "";
                          const labelText = `${titleName} (${p.weight} ${p.unit}) - [Kode: ${p.item_code}]`;
                          return (
                            <SelectItem key={p.id} value={p.id} label={labelText}>
                              {labelText}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-32 flex flex-col justify-end gap-2">
                    <Label className="text-xs text-muted-foreground font-medium">Qty (Pcs)</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="Qty" 
                      className="w-full"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    />
                  </div>
                  
                  <div className="w-full md:w-48 flex flex-col justify-end gap-2">
                    <Label className="text-xs text-muted-foreground font-medium">Harga Modal / Pcs</Label>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                      <Input 
                        type="text" 
                        className="w-full pl-8 text-right font-medium"
                        placeholder="0"
                        value={formatRupiah(item.cost_price)}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-auto pt-2 md:pt-0 pb-[1px]">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      disabled={items.length === 1}
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                      title="Hapus baris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Simpan Barang Masuk"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
