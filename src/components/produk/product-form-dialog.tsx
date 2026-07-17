"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertProduct } from "@/app/(dashboard)/produk/actions";
import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

function toTitleCase(str: string) {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export function ProductFormDialog({ product }: { product?: any }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(upsertProduct, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {product ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Edit
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Produk
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          <DialogDescription>
            Masukkan informasi detail produk. Kode sistem digunakan untuk barcode/import.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          {product && <input type="hidden" name="id" value={product.id} />}
          
          {state?.error && (
            <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md mt-4 mx-6">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-4">
            
            <div className="space-y-2">
              <Label htmlFor="item_code">
                Kode Barang
              </Label>
              <Input id="item_code" name="item_code" defaultValue={product?.item_code} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_code">
                Kode Sistem
              </Label>
              <Input id="system_code" name="system_code" defaultValue={product?.system_code} required />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                Nama
              </Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={product?.name ? toTitleCase(product.name) : ""} 
                required 
                className="capitalize" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Kategori
              </Label>
              <Select name="category" defaultValue={product?.category || "gold"} required items={[{value:'gold',label:'Emas'},{value:'silver',label:'Perak'}]}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Emas</SelectItem>
                  <SelectItem value="silver">Perak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Jenis / Model
              </Label>
              <Input 
                id="type" 
                name="type" 
                defaultValue={product?.type ? toTitleCase(product.type) : ""} 
                required 
                className="capitalize" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">
                Gramasi
              </Label>
              <Input id="weight" name="weight" type="number" step="0.0001" defaultValue={product?.weight} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Satuan
              </Label>
              <Select name="unit" defaultValue={product?.unit || "gram"} required items={[{value:'gram',label:'Gram'},{value:'dirham',label:'Dirham'},{value:'rupiya',label:'Rupiya'}]}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Satuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="dirham">Dirham</SelectItem>
                  <SelectItem value="rupiya">Rupiya</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
