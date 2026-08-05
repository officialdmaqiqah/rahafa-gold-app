"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, TrendingDown, RefreshCw, CheckCircle2 } from "lucide-react";
import { CATEGORIES_CONFIG, CategoryKey, matchProductCategory } from "@/lib/product-categories";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  currentPrices: Record<string, { retail: string; reseller: string; buyback: string }>;
  onApply: (newPrices: Record<string, { retail: string; reseller: string; buyback: string }>) => void;
}

interface CategoryInputState {
  mode: "delta" | "base"; // delta: +/-, base: harga acuan 1g / 1 dirham
  direction: "up" | "down";
  deltaAmount: string;
  basePrice: string;
}

export function BulkUpdateModal({ isOpen, onClose, data, currentPrices, onApply }: BulkUpdateModalProps) {
  // Initialize state for each of the 6 categories
  const [categoryInputs, setCategoryInputs] = useState<Record<CategoryKey, CategoryInputState>>({
    antam_certicard: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
    antam_retro: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
    minigold: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
    microgold: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
    dirham: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
    perak: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" }
  });

  // Group items by category for count, list, & benchmark price lookup
  const groupedProducts = useMemo(() => {
    const map: Record<CategoryKey, any[]> = {
      antam_certicard: [],
      antam_retro: [],
      minigold: [],
      microgold: [],
      dirham: [],
      perak: []
    };

    data.forEach(item => {
      const catKey = matchProductCategory(item.product);
      if (catKey) {
        map[catKey].push(item);
      }
    });

    // Sort products by weight within each category
    Object.keys(map).forEach(key => {
      map[key as CategoryKey].sort((a, b) => (a.product.weight || 0) - (b.product.weight || 0));
    });

    return map;
  }, [data]);

  const handleInputChange = (
    key: CategoryKey,
    field: keyof CategoryInputState,
    value: any
  ) => {
    setCategoryInputs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const formatRupiah = (val: string | number) => {
    if (!val && val !== 0) return "";
    const num = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, "") || "0");
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const handleReset = () => {
    setCategoryInputs({
      antam_certicard: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
      antam_retro: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
      minigold: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
      microgold: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
      dirham: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" },
      perak: { mode: "delta", direction: "up", deltaAmount: "", basePrice: "" }
    });
  };

  const handleApplyAll = () => {
    const updatedPrices = { ...currentPrices };

    data.forEach(item => {
      const p = item.product;
      const catKey = matchProductCategory(p);
      if (!catKey) return;

      const input = categoryInputs[catKey];
      if (!input) return;

      let weightFactor = p.weight || 1;
      if (catKey === "dirham") {
        weightFactor = p.weight ? p.weight / 3.11 : 1;
      }

      if (input.mode === "base") {
        const basePriceNum = parseInt(input.basePrice.replace(/\D/g, "") || "0");
        if (basePriceNum > 0) {
          const newPrice = Math.round(basePriceNum * weightFactor);
          updatedPrices[p.id] = {
            ...updatedPrices[p.id],
            retail: String(newPrice)
          };
        }
      } else if (input.mode === "delta") {
        const deltaAmountNum = parseInt(input.deltaAmount.replace(/\D/g, "") || "0");
        if (deltaAmountNum > 0) {
          const deltaPerUnit = input.direction === "up" ? deltaAmountNum : -deltaAmountNum;
          const currentPriceStr = updatedPrices[p.id]?.retail || 
                                  (item.price?.retail_sell_price ? String(item.price.retail_sell_price) : "0");
          const currentPriceNum = parseInt(currentPriceStr) || 0;
          const totalDelta = Math.round(deltaPerUnit * weightFactor);
          const newPrice = Math.max(0, currentPriceNum + totalDelta);

          updatedPrices[p.id] = {
            ...updatedPrices[p.id],
            retail: String(newPrice)
          };
        }
      }
    });

    onApply(updatedPrices);
    onClose();
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
                Update Harga Massal (6 Kategori)
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5 text-slate-500">
                Masukkan nilai perubahan untuk kategori. Anggota produk & varian berat akan dihitung otomatis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES_CONFIG.map((config) => {
              const catItems = groupedProducts[config.key] || [];
              const input = categoryInputs[config.key];
              
              // Find sample 1g / 1 dirham benchmark price
              const benchmarkItem = catItems.find(i => 
                config.key === "dirham" ? (i.product.weight === 3.11 || i.product.name.includes("1 DIRHAM")) : (i.product.weight === 1)
              ) || catItems[0];
              const benchmarkPrice = benchmarkItem?.price?.retail_sell_price 
                ? formatRupiah(benchmarkItem.price.retail_sell_price)
                : (currentPrices[benchmarkItem?.product?.id]?.retail ? formatRupiah(currentPrices[benchmarkItem?.product?.id]?.retail) : "-");

              return (
                <div 
                  key={config.key} 
                  className="border rounded-xl p-4 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-all space-y-3 border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Category Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${config.badgeColor} font-bold px-2.5 py-0.5 text-xs`}>
                          {config.label}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-500">({catItems.length} Produk)</span>
                      </div>
                      {benchmarkItem && (
                        <span className="text-xs text-slate-500 font-medium">
                          Saat ini: <strong className="text-slate-800 dark:text-slate-200">Rp {benchmarkPrice}</strong> /{config.key === "dirham" ? "dirham" : "gr"}
                        </span>
                      )}
                    </div>

                    {/* Mode Selector (Subtle Pill Segmented Control) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span>Metode Input</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleInputChange(config.key, "mode", "delta")}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              input.mode === "delta" 
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            Selisih (+/-)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange(config.key, "mode", "base")}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              input.mode === "base" 
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            Harga Acuan Baru
                          </button>
                        </div>
                      </div>

                      {input.mode === "delta" ? (
                        <div className="flex gap-2 items-center">
                          {/* Direction Toggle: Up (+) or Down (-) */}
                          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleInputChange(config.key, "direction", "up")}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                input.direction === "up" 
                                  ? "bg-emerald-600 text-white shadow" 
                                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                              }`}
                            >
                              <TrendingUp className="h-3.5 w-3.5" /> Naik (+)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputChange(config.key, "direction", "down")}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                input.direction === "down" 
                                  ? "bg-rose-600 text-white shadow" 
                                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                              }`}
                            >
                              <TrendingDown className="h-3.5 w-3.5" /> Turun (-)
                            </button>
                          </div>

                          {/* Delta Amount Input */}
                          <div className="relative flex-1 min-w-[100px]">
                            <span className="absolute left-2.5 top-2.5 text-xs font-medium text-slate-400">Rp</span>
                            <Input
                              placeholder={`0 (${config.unitLabel})`}
                              className="pl-7 text-right font-bold h-9 text-sm border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#294376]"
                              value={formatRupiah(input.deltaAmount)}
                              onChange={(e) => {
                                const clean = e.target.value.replace(/\D/g, "");
                                handleInputChange(config.key, "deltaAmount", clean);
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-medium text-slate-400">Rp</span>
                          <Input
                            placeholder={`Harga Baru 1 ${config.key === "dirham" ? "Dirham" : "Gram"}`}
                            className="pl-8 text-right font-bold h-9 text-sm border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#294376]"
                            value={formatRupiah(input.basePrice)}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/\D/g, "");
                              handleInputChange(config.key, "basePrice", clean);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset Form
          </Button>

          <div className="flex gap-2.5 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onClose} className="px-5 font-semibold text-slate-600">
              Batal
            </Button>
            <Button 
              onClick={handleApplyAll}
              className="bg-[#294376] hover:bg-[#1a2d54] text-white font-bold px-6 shadow-md rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Terapkan Ke Semua Produk
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
