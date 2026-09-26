"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, TrendingUp, TrendingDown, Percent, AlertCircle, CheckCircle2 } from "lucide-react";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  currentPrices: Record<string, { retail: string; reseller?: string; buyback?: string }>;
  onApply: (newPrices: Record<string, { retail: string; reseller?: string; buyback?: string }>) => void;
}

type UpdateMethod = "nominal_up" | "nominal_down" | "percent_up" | "percent_down";

export function isProductMatchingTarget(p: any, target: string): boolean {
  if (target === "all") return true;
  if (target === "cat:gold") return p.category === "gold";
  if (target === "cat:silver") return p.category === "silver";

  const t = (p.type || "").toUpperCase().trim();
  const n = (p.name || "").toUpperCase().trim();

  if (target === "type:antam") {
    return (t === "ANTAM" || t.includes("ANTAM CERTICARD") || (p.category === "gold" && n.includes("ANTAM"))) && !t.includes("RETRO") && !n.includes("RETRO");
  }
  if (target === "type:retro") {
    return t.includes("RETRO") || n.includes("RETRO");
  }
  if (target === "type:minigold") {
    return t.includes("MINIGOLD") || n.includes("MINIGOLD");
  }
  if (target === "type:microgold") {
    return t.includes("MICRO") || n.includes("MICRO");
  }
  if (target === "type:silverium") {
    return t.includes("SILVERIUM") || n.includes("SILVERIUM");
  }
  if (target === "type:dirham") {
    return t.includes("DIRHAM") || n.includes("DIRHAM");
  }
  if (target === "type:rupiya") {
    return t.includes("RUPIYA") || n.includes("RUPIYA");
  }

  return false;
}

export function BulkUpdateModal({ isOpen, onClose, data, currentPrices, onApply }: BulkUpdateModalProps) {
  const [target, setTarget] = useState<string>("all");
  const [method, setMethod] = useState<UpdateMethod>("nominal_up");
  const [amountInput, setAmountInput] = useState<string>("");

  const formatRupiah = (val: number | string) => {
    if (!val && val !== 0) return "0";
    const num = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, "") || "0");
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const parsedAmount = useMemo(() => {
    if (method.startsWith("percent")) {
      const clean = amountInput.replace(/[^0-9.]/g, "");
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    } else {
      const clean = amountInput.replace(/\D/g, "");
      const num = parseInt(clean);
      return isNaN(num) ? 0 : num;
    }
  }, [amountInput, method]);

  // Compute preview list
  const previewItems = useMemo(() => {
    const list: Array<{
      id: string;
      item_code: string;
      name: string;
      category: string;
      oldPrice: number;
      newPrice: number;
      diff: number;
      isInvalid: boolean;
    }> = [];

    data.forEach((item) => {
      const p = item.product;
      if (!isProductMatchingTarget(p, target)) return;

      const currentPriceStr = currentPrices[p.id]?.retail || 
                             (item.price?.retail_sell_price ? String(item.price.retail_sell_price) : "0");
      const oldPrice = parseInt(currentPriceStr) || 0;

      let newPrice = oldPrice;
      if (parsedAmount > 0) {
        if (method === "nominal_up") {
          newPrice = oldPrice + parsedAmount;
        } else if (method === "nominal_down") {
          newPrice = oldPrice - parsedAmount;
        } else if (method === "percent_up") {
          newPrice = Math.round(oldPrice * (1 + parsedAmount / 100));
        } else if (method === "percent_down") {
          newPrice = Math.round(oldPrice * (1 - parsedAmount / 100));
        }
      }

      const diff = newPrice - oldPrice;
      const isInvalid = parsedAmount > 0 && newPrice <= 0;

      list.push({
        id: p.id,
        item_code: p.item_code,
        name: p.name,
        category: p.category,
        oldPrice,
        newPrice,
        diff,
        isInvalid
      });
    });

    return list;
  }, [data, currentPrices, target, method, parsedAmount]);

  const hasInvalidPrice = useMemo(() => {
    return previewItems.some((item) => item.isInvalid);
  }, [previewItems]);

  const handleApply = () => {
    if (hasInvalidPrice || parsedAmount <= 0 || previewItems.length === 0) return;

    const updated = { ...currentPrices };
    previewItems.forEach((item) => {
      updated[item.id] = {
        ...updated[item.id],
        retail: String(item.newPrice)
      };
    });

    onApply(updated);
    onClose();
  };

  const handleReset = () => {
    setAmountInput("");
    setTarget("all");
    setMethod("nominal_up");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl border-slate-200 dark:border-slate-800">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#294376] dark:text-white">
                Update Harga Massal
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5 text-slate-500">
                Pilih target produk dan metode penyesuaian untuk mengubah Harga Hari Ini secara serentak.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Controls: Target, Method, Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* 1. Target Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Produk
              </Label>
              <Select value={target} onValueChange={(val) => setTarget(val || "all")}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-950 font-medium text-xs">
                  <SelectValue placeholder="Pilih Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Produk</SelectItem>
                  <SelectItem value="cat:gold">Kategori Emas</SelectItem>
                  <SelectItem value="cat:silver">Kategori Perak</SelectItem>
                  <SelectItem value="type:antam">Tipe Antam (Certicard)</SelectItem>
                  <SelectItem value="type:retro">Tipe Retro Antam</SelectItem>
                  <SelectItem value="type:minigold">Tipe MiniGold</SelectItem>
                  <SelectItem value="type:microgold">Tipe Micro Gold</SelectItem>
                  <SelectItem value="type:silverium">Tipe Silverium</SelectItem>
                  <SelectItem value="type:dirham">Tipe Dirham</SelectItem>
                  <SelectItem value="type:rupiya">Tipe Rupiya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Method Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Metode Perubahan
              </Label>
              <Select value={method} onValueChange={(val) => setMethod(val as UpdateMethod)}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-950 font-medium text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nominal_up">Naik Nominal (+ Rp)</SelectItem>
                  <SelectItem value="nominal_down">Turun Nominal (- Rp)</SelectItem>
                  <SelectItem value="percent_up">Naik Persentase (+ %)</SelectItem>
                  <SelectItem value="percent_down">Turun Persentase (- %)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Amount Value Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {method.startsWith("nominal") ? "Nilai Nominal (Rp)" : "Persentase (%)"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">
                  {method.startsWith("nominal") ? "Rp" : "%"}
                </span>
                <Input
                  className="pl-9 text-right font-bold h-10 text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  placeholder={method.startsWith("nominal") ? "Contoh: 10.000" : "Contoh: 2.5"}
                  value={method.startsWith("nominal") ? formatRupiah(amountInput) : amountInput}
                  onChange={(e) => {
                    if (method.startsWith("percent")) {
                      // Allow numbers and one dot
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setAmountInput(val);
                    } else {
                      const clean = e.target.value.replace(/\D/g, "");
                      setAmountInput(clean);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Validation Banner if hasInvalidPrice */}
          {hasInvalidPrice && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <strong>Peringatan:</strong> Penurunan harga terlalu besar! Terdapat produk dengan harga akhir menjadi <strong>&le; Rp 0</strong>. Silakan kurangi nilai perubahan.
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Target Terkena: <strong className="text-slate-800 dark:text-slate-200">{previewItems.length} Produk</strong></span>
              <span>•</span>
              <span>
                Operasi: <strong className="text-slate-800 dark:text-slate-200">
                  {method === "nominal_up" && `+Rp ${formatRupiah(parsedAmount)}`}
                  {method === "nominal_down" && `-Rp ${formatRupiah(parsedAmount)}`}
                  {method === "percent_up" && `+${parsedAmount}%`}
                  {method === "percent_down" && `-${parsedAmount}%`}
                </strong>
              </span>
            </div>
            {parsedAmount > 0 && !hasInvalidPrice && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-semibold">
                Semua perhitungan valid
              </Badge>
            )}
          </div>

          {/* Preview Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
            <div className="max-h-[340px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 z-10 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Kode</th>
                    <th className="py-2.5 px-4">Nama Produk</th>
                    <th className="py-2.5 px-4 text-right">Harga Lama</th>
                    <th className="py-2.5 px-4 text-right">Harga Baru</th>
                    <th className="py-2.5 px-4 text-right">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada produk yang sesuai dengan target filter.
                      </td>
                    </tr>
                  ) : (
                    previewItems.map((item) => (
                      <tr 
                        key={item.id}
                        className={item.isInvalid ? "bg-rose-50/60 dark:bg-rose-950/20" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"}
                      >
                        <td className="py-2.5 px-4 font-mono text-slate-500">{item.item_code}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-600">
                          Rp {formatRupiah(item.oldPrice)}
                        </td>
                        <td className={`py-2.5 px-4 text-right font-bold ${item.isInvalid ? "text-rose-600" : "text-[#294376] dark:text-white"}`}>
                          Rp {formatRupiah(item.newPrice)}
                          {item.isInvalid && <span className="block text-[10px] text-rose-500 font-semibold">(Tidak Valid &le; 0)</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold">
                          {item.diff > 0 && <span className="text-emerald-600 font-bold">+{formatRupiah(item.diff)}</span>}
                          {item.diff < 0 && <span className="text-rose-600 font-bold">{formatRupiah(item.diff)}</span>}
                          {item.diff === 0 && <span className="text-slate-400">0</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="text-slate-600 hover:text-slate-900 border-slate-200 font-semibold"
          >
            Reset
          </Button>

          <div className="flex gap-2.5 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onClose} className="px-5 font-semibold text-slate-600">
              Batal
            </Button>
            <Button 
              onClick={handleApply}
              disabled={hasInvalidPrice || parsedAmount <= 0 || previewItems.length === 0}
              className="bg-[#294376] hover:bg-[#1a2d54] text-white font-bold px-6 shadow-md rounded-lg disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Terapkan ke Draft
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
