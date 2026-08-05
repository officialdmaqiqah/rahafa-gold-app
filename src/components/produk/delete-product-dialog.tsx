"use client";

import { useState } from "react";
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
import { deleteProduct } from "@/app/(dashboard)/produk/actions";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeleteProductDialogProps {
  product: {
    id: string;
    item_code: string;
    system_code: string;
    name: string;
  };
}

export function DeleteProductDialog({ product }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const result = await deleteProduct(product.id);
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      if (result.wasSoftDeleted) {
        setInfoMsg(result.message);
        setTimeout(() => {
          setOpen(false);
        }, 1500);
      } else {
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) {
        setErrorMsg(null);
        setInfoMsg(null);
      }
    }}>
      <DialogTrigger render={
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Hapus</span>
        </Button>
      } />
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Hapus Produk
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus produk ini?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 px-1 space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-sm space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {product.name}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Kode Barang: {product.item_code} | Kode Sistem: {product.system_code}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Jika produk sudah memiliki riwayat transaksi/stok, sistem akan otomatis menonaktifkan status produk (Soft Delete) agar laporan riwayat keuangan tetap terjaga.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              {infoMsg}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="font-medium"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="font-bold bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus Produk"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
