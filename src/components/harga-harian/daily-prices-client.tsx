"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Search, Save, Copy, CheckCircle, AlertTriangle, Loader2, PlusCircle } from "lucide-react";
import { saveDailyPricesDraft, activateDailyPrices, copyPreviousPrices } from "@/app/(dashboard)/harga-harian/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DailyPricesClientProps {
  date: string;
  data: any[];
  search?: string;
  category?: string;
  allCount: number;
  sessionName?: string;
  status?: string;
}

export function DailyPricesClient({ date, data, search, category, allCount, sessionName, status }: DailyPricesClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditingNewSession, setIsEditingNewSession] = useState(false);
  
  // Local state for form values
  const [prices, setPrices] = useState<Record<string, { retail: string, reseller: string, buyback: string }>>({});
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: "activate" | "copy" | null;
  }>({ isOpen: false, title: "", description: "", action: null });

  useEffect(() => {
    // Initialize prices from props
    const initial: Record<string, { retail: string, reseller: string, buyback: string }> = {};
    data.forEach(item => {
      initial[item.product.id] = {
        retail: item.price?.retail_sell_price ? String(item.price.retail_sell_price) : "",
        reseller: "",
        buyback: ""
      };
    });
    setPrices(initial);
    setIsEditingNewSession(false);
  }, [data]);

  const overallStatus = status || "not_set";
  const effectiveStatus = isEditingNewSession ? "draft" : overallStatus;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set("date", newDate);
    router.push(url.pathname + url.search);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    router.push(url.pathname + url.search);
  };

  const handleCategoryChange = (val: string | null) => {
    if (!val) return;
    const url = new URL(window.location.href);
    if (val !== "all") url.searchParams.set("category", val);
    else url.searchParams.delete("category");
    router.push(url.pathname + url.search);
  };

  const handlePriceChange = (productId: string, field: "retail" | "reseller" | "buyback", value: string) => {
    // Only allow numbers
    const cleanValue = value.replace(/\D/g, "");
    setPrices(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: cleanValue
      }
    }));
  };

  const formatRupiah = (val: string) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(val));
  };

  const handleSaveDraft = async () => {
    setIsPending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = Object.entries(prices).map(([productId, vals]) => ({
        product_id: productId,
        retail_sell_price: vals.retail ? parseInt(vals.retail) : 0,
        reseller_sell_price: null,
        buyback_price: null,
      }));

      const res = await saveDailyPricesDraft(date, payload);
      if (res.error) throw new Error(res.error);
      
      setSuccessMsg("Draft harga berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsPending(false);
    }
  };

  const executeActivate = async () => {
    setIsPending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // First save current inputs as draft just in case they were modified
      const payload = Object.entries(prices).map(([productId, vals]) => ({
        product_id: productId,
        retail_sell_price: vals.retail ? parseInt(vals.retail) : 0,
        reseller_sell_price: null,
        buyback_price: null,
      }));
      await saveDailyPricesDraft(date, payload);

      const res = await activateDailyPrices(date);
      if (res.error) throw new Error(res.error);
      
      setSuccessMsg("Harga berhasil diaktifkan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsPending(false);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleActivate = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Konfirmasi Aktivasi",
      description: "Aktifkan harga untuk tanggal ini? Setelah aktif, harga dapat digunakan dalam transaksi.",
      action: "activate"
    });
  };

  const executeCopyPrevious = async () => {
    setIsPending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await copyPreviousPrices(date);
      if (res.error) throw new Error(res.error);
      
      setSuccessMsg(`Berhasil menyalin dari tanggal ${res.fromDate}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsPending(false);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleCopyPrevious = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Salin Harga Terakhir",
      description: "Salin harga aktif terakhir ke tanggal ini sebagai draft?",
      action: "copy"
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === "activate") executeActivate();
    else if (confirmDialog.action === "copy") executeCopyPrevious();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/50 p-4 rounded-lg border">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Pilih Tanggal</label>
          <div className="flex items-center gap-3">
            <Input 
              type="date" 
              value={date} 
              onChange={handleDateChange} 
              className="w-auto"
            />
            {overallStatus === "active" && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {sessionName ? `${sessionName} - ` : ""}Aktif
              </Badge>
            )}
            {overallStatus === "draft" && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                {sessionName ? `${sessionName} - ` : ""}Draft
              </Badge>
            )}
            {overallStatus === "not_set" && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                Belum Ada Harga
              </Badge>
            )}
            {overallStatus === "archived" && (
              <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">
                {sessionName ? `${sessionName} - ` : ""}Arsip
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {overallStatus === "not_set" && (
            <Button variant="outline" onClick={handleCopyPrevious} disabled={isPending} className="px-4 h-9 border-blue-900/30 text-blue-950 bg-transparent hover:bg-blue-50 hover:text-blue-900 dark:border-blue-400/30 dark:text-blue-300 dark:hover:bg-blue-900/20 font-semibold shadow-sm transition-all">
              <Copy className="h-4 w-4" /> Copy Harga Kemarin
            </Button>
          )}
          {overallStatus === "active" && !isEditingNewSession && (
            <Button onClick={() => setIsEditingNewSession(true)} disabled={isPending} className="px-4 h-9 border-blue-900 text-blue-900 bg-white hover:bg-blue-50 font-semibold shadow-sm transition-all">
              <PlusCircle className="h-4 w-4 mr-1" /> Buat Harga Sesi Baru
            </Button>
          )}
          {effectiveStatus !== "active" && (
            <Button onClick={handleSaveDraft} disabled={isPending} className="px-4 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all">
              <Save className="h-4 w-4 mr-1" /> {isEditingNewSession ? "Simpan Draft Sesi Baru" : "Simpan Draft"}
            </Button>
          )}
          {(effectiveStatus === "draft" || effectiveStatus === "active") && (
            <Button onClick={handleActivate} disabled={isPending || effectiveStatus === "active"} className={`px-4 h-9 bg-[#0a1128] hover:bg-[#101b3b] text-white font-semibold shadow-md border border-[#0a1128] transition-all ${effectiveStatus === "active" ? "hidden" : ""}`}>
              <CheckCircle className="h-4 w-4 text-emerald-400 mr-1" /> Aktifkan Sesi Ini
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Cari produk..."
              className="pl-8"
              defaultValue={search}
            />
          </div>
          <Button type="submit" className="bg-[#294376] hover:bg-[#1a2d54] text-white">Cari</Button>
        </form>

        <div className="w-full md:w-[200px]">
          <Select defaultValue={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="gold">Emas</SelectItem>
              <SelectItem value="silver">Perak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product List */}
      {data.length === 0 ? (
        <div className="text-center p-12 border rounded-lg text-muted-foreground bg-muted/20">
          Tidak ada produk yang ditemukan.
        </div>
      ) : (
        <Accordion 
          // @ts-ignore
          type="multiple" 
          value={expandedIds}
          onValueChange={(newVals) => {
            const added = newVals.find(id => !expandedIds.includes(id));
            const removed = expandedIds.find(id => !newVals.includes(id));
            
            const cols = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1) : 3;
            
            if (added) {
               const index = data.findIndex(d => d.product.id === added);
               const start = Math.floor(index / cols) * cols;
               const idsToOpen = data.slice(start, start + cols).map(d => d.product.id);
               
               const next = new Set(expandedIds);
               idsToOpen.forEach(id => next.add(id));
               setExpandedIds(Array.from(next));
            } else if (removed) {
               const index = data.findIndex(d => d.product.id === removed);
               const start = Math.floor(index / cols) * cols;
               const idsToClose = data.slice(start, start + cols).map(d => d.product.id);
               
               const next = new Set(expandedIds);
               idsToClose.forEach(id => next.delete(id));
               setExpandedIds(Array.from(next));
            } else {
               setExpandedIds(newVals);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start"
        >
          {data.map((item) => {
            const p = item.product;
            const vals = prices[p.id] || { retail: "" };
            
            return (
              <AccordionItem value={p.id} key={p.id} className={`border bg-card text-card-foreground shadow-sm rounded-lg overflow-hidden ${effectiveStatus === "active" ? "opacity-75 bg-muted/30" : ""}`}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex justify-between items-start w-full pr-4 text-left">
                    <div>
                      <div className="text-base font-semibold text-[#294376] dark:text-white">{p.name}</div>
                      <div className="text-sm font-normal text-slate-500">{p.item_code} • {p.weight} {p.unit}</div>
                    </div>
                    <Badge variant={p.category === 'gold' ? 'default' : 'secondary'} className="text-xs">
                      {p.category === 'gold' ? 'Emas' : 'Perak'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 border-t space-y-3">
                  {/* Retail Price */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Harga (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground text-sm">Rp</span>
                      <Input 
                        className="pl-8 text-right font-medium"
                        value={formatRupiah(vals.retail)}
                        onChange={(e) => handlePriceChange(p.id, "retail", e.target.value)}
                        disabled={effectiveStatus === "active"}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Floating Save Button on Mobile if not active */}
      {effectiveStatus !== "active" && data.length > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-10">
          <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0" onClick={handleSaveDraft} disabled={isPending}>
            {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(val) => !isPending && setConfirmDialog(prev => ({ ...prev, isOpen: val }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#294376] flex items-center justify-center gap-2 text-xl">
              <CheckCircle className="h-6 w-6" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3 sm:justify-center px-6 pb-6 border-none bg-transparent">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} disabled={isPending} className="w-full sm:w-32 rounded-full h-11 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm">
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={isPending} className="w-full sm:w-auto rounded-full h-11 bg-[#294376] hover:bg-[#1a2d54] text-white font-semibold shadow-sm">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
