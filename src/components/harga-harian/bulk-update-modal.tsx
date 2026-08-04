"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, TrendingUp, TrendingDown, RefreshCw, CheckCircle2, Info, Coins, Layers } from "lucide-react";
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

  // Group items by category for count & benchmark price lookup
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
    const num = typeof val === "number" ? val : parseInt(val.replace(/\D/g, "") || "0");
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
    let affectedCount = 0;

    data.forEach(item => {
      const p = item.product;
      const catKey = matchProductCategory(p);
      if (!catKey) return;

      const input = categoryInputs[catKey];
      let deltaPerUnit = 0;

      if (input.mode === "delta") {
        const amount = parseInt(input.deltaAmount.replace(/\D/g, "") || "0");
        if (amount > 0) {
          deltaPerUnit = input.direction === "up" ? amount : -amount;
        }
      } else if (input.mode === "base") {
        const newBase = parseInt(input.basePrice.replace(/\D/g, "") || "0");
        if (newBase > 0) {
          // Find benchmark product for this category (weight = 1 or 1 dirham)
          const categoryItems = groupedProducts[catKey];
          const benchmarkItem = categoryItems.find(i => 
            catKey === "dirham" ? (i.product.weight === 3.11 || i.product.name.includes("1 DIRHAM")) : (i.product.weight === 1)
          ) || categoryItems[0];

          if (benchmarkItem) {
            const currentRetailStr = updatedPrices[benchmarkItem.product.id]?.retail || 
                                   (benchmarkItem.price?.retail_sell_price ? String(benchmarkItem.price.retail_sell_price) : "0");
            const currentBase = parseInt(currentRetailStr) || 0;
            if (currentBase > 0) {
              deltaPerUnit = newBase - currentBase;
            }
          }
        }
      }

      if (deltaPerUnit !== 0) {
        // Calculate weight multiplier
        let weightFactor = p.weight;
        if (catKey === "dirham") {
          // For dirham, 3.11g is 1 dirham unit factor
          weightFactor = p.weight ? p.weight / 3.11 : 1;
        }

        const currentPriceStr = updatedPrices[p.id]?.retail || 
                                (item.price?.retail_sell_price ? String(item.price.retail_sell_price) : "0");
        const currentPriceNum = parseInt(currentPriceStr) || 0;

        const totalDelta = Math.round(deltaPerUnit * weightFactor);
        const newPrice = Math.max(0, currentPriceNum + totalDelta);

        updatedPrices[p.id] = {
          ...updatedPrices[p.id],
          retail: String(newPrice)
        };
        affectedCount++;
      }
    });

    onApply(updatedPrices);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#294376] dark:text-white">
                Update Harga Massal (6 Kategori)
              </DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                Masukkan nilai perubahan harga untuk 6 kategori. Harga seluruh varian produk akan otomatis dihitung.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${config.badgeColor} font-semibold px-2.5 py-0.5 text-xs`}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">({catItems.length} produk)</span>
                    </div>
                    {benchmarkItem && (
                      <span className="text-xs text-slate-500 font-medium">
                        Saat ini: <strong className="text-slate-800 dark:text-slate-200">Rp {benchmarkPrice}</strong> /{config.key === "dirham" ? "dirham" : "gr"}
                      </span>
                    )}
                  </div>

                  {/* Mode Tabs: Delta (+/-) vs Base Price */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Metode Input</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleInputChange(config.key, "mode", "delta")}
                          className={`px-2 py-0.5 rounded text-xs transition-colors ${input.mode === "delta" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
                        >
                          Kenaikan/Penurunan (+/-)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange(config.key, "mode", "base")}
                          className={`px-2 py-0.5 rounded text-xs transition-colors ${input.mode === "base" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
                        >
                          Harga Baru Acuan
                        </button>
                      </div>
                    </div>

                    {input.mode === "delta" ? (
                      <div className="flex gap-2 items-center">
                        {/* Direction Toggle: Up (+) or Down (-) */}
                        <div className="flex rounded-lg border p-1 bg-muted/40 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleInputChange(config.key, "direction", "up")}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                              input.direction === "up" 
                                ? "bg-emerald-600 text-white shadow-sm" 
                                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                            }`}
                          >
                            <TrendingUp className="h-3.5 w-3.5" /> Naik (+)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange(config.key, "direction", "down")}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                              input.direction === "down" 
                                ? "bg-red-600 text-white shadow-sm" 
                                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                            }`}
                          >
                            <TrendingDown className="h-3.5 w-3.5" /> Turun (-)
                          </button>
                        </div>

                        {/* Delta Amount Input */}
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">Rp</span>
                          <Input
                            placeholder={`0 (${config.unitLabel})`}
                            className="pl-8 text-right font-semibold h-9 text-sm"
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
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">Rp</span>
                        <Input
                          placeholder={`Harga Baru 1 ${config.key === "dirham" ? "Dirham" : "Gram"}`}
                          className="pl-8 text-right font-semibold h-9 text-sm"
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
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t bg-muted/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Reset Form
          </Button>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" onClick={onClose} className="px-5">
              Batal
            </Button>
            <Button 
              onClick={handleApplyAll}
              className="bg-[#294376] hover:bg-[#1a2d54] text-white font-semibold px-6 shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Terapkan Ke Semua Produk
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
