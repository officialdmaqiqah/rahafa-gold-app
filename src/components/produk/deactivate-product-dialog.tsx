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
import { toggleProductStatus } from "@/app/(dashboard)/produk/actions";
import { Loader2, Power, CheckCircle2, AlertCircle } from "lucide-react";

interface DeactivateProductDialogProps {
  product: {
    id: string;
    item_code: string;
    system_code: string;
    name: string;
    is_active: boolean;
  };
}

export function DeactivateProductDialog({ product }: DeactivateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCurrentlyActive = product.is_active;

  const handleToggle = async () => {
    setLoading(true);
    setErrorMsg(null);

    const result = await toggleProductStatus(product.id, isCurrentlyActive);
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) setErrorMsg(null);
    }}>
      <DialogTrigger render={
        isCurrentlyActive ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Nonaktifkan Produk"
          >
            <Power className="h-4 w-4" />
            <span className="sr-only">Nonaktifkan</span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            title="Aktifkan Kembali"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="sr-only">Aktifkan</span>
          </Button>
        )
      } />
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center text-center">
          {isCurrentlyActive ? (
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mb-1">
              <Power className="h-6 w-6" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          )}

          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {isCurrentlyActive ? "Nonaktifkan Produk" : "Aktifkan Kembali Produk"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            {isCurrentlyActive 
              ? "Produk yang dinonaktifkan tidak akan muncul pada pilihan transaksi/invoice baru."
              : "Produk akan kembali aktif dan siap digunakan untuk transaksi/invoice baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-sm space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {product.name}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Kode Barang: {product.item_code} | Kode Sistem: {product.system_code}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed px-0.5">
            {isCurrentlyActive ? (
              "Seluruh riwayat transaksi & stok lama produk ini tetap tersimpan dengan aman dan akurat di laporan keuangan."
            ) : (
              "Produk akan aktif kembali di master data dan opsi pembuatan transaksi."
            )}
          </p>

          {errorMsg && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="font-medium"
          >
            Batal
          </Button>

          {isCurrentlyActive ? (
            <Button
              type="button"
              onClick={handleToggle}
              disabled={loading}
              className="font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Nonaktifkan Produk"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleToggle}
              disabled={loading}
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Aktifkan Produk"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
