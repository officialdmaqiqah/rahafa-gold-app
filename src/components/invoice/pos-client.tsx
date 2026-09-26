"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, AlertTriangle, XCircle, CheckCircle, Calendar, ShieldCheck, KeyRound } from "lucide-react";
import { validateCart, checkout, getPricesForDate } from "@/app/(dashboard)/buat-invoice/actions";
import { formatRupiah } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PosClientProps {
  products: any[];
  customers: any[];
  hasMissingTodayPrice?: boolean;
}

export function PosClient({ products: initialProducts, customers, hasMissingTodayPrice: initialMissingPrice }: PosClientProps) {
  const router = useRouter();
  
  // Date & Backdate State
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const [transactionDate, setTransactionDate] = useState(todayStr);
  const [backdateReason, setBackdateReason] = useState("");
  const [isLoadingDatePrices, setIsLoadingDatePrices] = useState(false);
  const [currentProducts, setCurrentProducts] = useState(initialProducts);
  const [hasMissingDatePrice, setHasMissingDatePrice] = useState(initialMissingPrice);

  // Transaction State
  const [transactionType, setTransactionType] = useState("sale_general");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amountPaidStr, setAmountPaidStr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  
  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qtyStr, setQtyStr] = useState("1");
  const [customPriceStr, setCustomPriceStr] = useState("");
  
  // Submit State
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [requiresLossOverride, setRequiresLossOverride] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [warningDetails, setWarningDetails] = useState<any[]>([]);
  const [ownerPin, setOwnerPin] = useState("");
  const [ownerPinError, setOwnerPinError] = useState("");

  // Calculate day difference
  const diffDays = useMemo(() => {
    if (!transactionDate) return 0;
    const todayMs = new Date(todayStr + "T00:00:00Z").getTime();
    const trxMs = new Date(transactionDate + "T00:00:00Z").getTime();
    return Math.round((todayMs - trxMs) / 86400000);
  }, [transactionDate, todayStr]);

  const isBackdated = diffDays > 0;
  const isDeepBackdated = diffDays > 1;

  // Handle transaction date change
  const handleDateChange = async (newDate: string) => {
    if (newDate > todayStr) {
      setErrorMsg("Tanggal transaksi tidak boleh lebih dari hari ini.");
      return;
    }
    setTransactionDate(newDate);
    setErrorMsg("");
    setIsLoadingDatePrices(true);

    try {
      const res = await getPricesForDate(newDate);
      setCurrentProducts(res.products);
      setHasMissingDatePrice(res.hasMissingPrice);
      // Reset currently picked product price input
      setCustomPriceStr("");
    } catch (err: any) {
      setErrorMsg("Gagal memuat harga untuk tanggal yang dipilih: " + err.message);
    } finally {
      setIsLoadingDatePrices(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (cart.length === 0) {
      setWarningDetails([]);
      setRequiresLossOverride(false);
      return;
    }

    validateCart(cart).then(validation => {
      if (!active) return;
      if (validation.hasMinus) {
        const details: any[] = [];
        validation.validations.forEach((val: any) => {
          if (val.isMinus) {
            const cartItem = cart.find(c => c.productId === val.productId);
            if (cartItem) {
              let profitQty = 0;
              let lossQty = 0;
              val.allocated.forEach((alloc: any) => {
                if (alloc.cost_price > cartItem.unitPrice) {
                  lossQty += alloc.quantity;
                } else {
                  profitQty += alloc.quantity;
                }
              });
              details.push({
                name: cartItem.name,
                profitQty,
                lossQty
              });
            }
          }
        });
        setWarningDetails(details);
        setRequiresLossOverride(true);
      } else {
        setWarningDetails([]);
        setRequiresLossOverride(false);
      }
    });
    return () => { active = false; };
  }, [cart]);

  const selectedProduct = currentProducts.find(p => p.id === selectedProductId);
  
  const defaultPrice = useMemo(() => {
    if (!selectedProduct || !selectedProduct.price) return 0;
    if (transactionType === "sale_reseller") {
      return Number(selectedProduct.price.reseller_sell_price) || 0;
    }
    return Number(selectedProduct.price.retail_sell_price) || 0;
  }, [selectedProduct, transactionType]);

  const isPriceMissingForDate = useMemo(() => {
    if (!selectedProduct) return false;
    if (!selectedProduct.price) return true;
    if (transactionType === "sale_reseller") {
      return !selectedProduct.price.reseller_sell_price || Number(selectedProduct.price.reseller_sell_price) <= 0;
    }
    return !selectedProduct.price.retail_sell_price || Number(selectedProduct.price.retail_sell_price) <= 0;
  }, [selectedProduct, transactionType]);

  const handleCustomerSelect = (val: string | null) => {
    if (!val) return;
    setCustomerId(val);
    const cust = customers.find(c => c.id === val);
    if (cust) {
      if (cust.customer_type === "reseller") {
        setTransactionType("sale_reseller");
      }
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || "");
    } else {
      setCustomerName("");
      setCustomerPhone("");
    }
  };

  const handleTransactionTypeChange = (val: string | null) => {
    if (val) setTransactionType(val);
  };

  const handleProductSelect = (val: string | null) => {
    if (val) {
      setSelectedProductId(val);
      setCustomPriceStr("");
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0) return;

    // Check custom price or default price
    let unitPrice = defaultPrice;
    let isManualPrice = false;

    if (customPriceStr) {
      const parsed = parseInt(customPriceStr.replace(/\D/g, ""));
      if (!isNaN(parsed)) unitPrice = parsed;
    }

    if (isPriceMissingForDate) {
      if (unitPrice <= 0) {
        setErrorMsg("Harga untuk tanggal transaksi ini belum tersedia. Update harga tanggal tersebut atau input harga manual dengan otorisasi owner.");
        return;
      }
      isManualPrice = true;
    }

    // Validasi harga reseller
    if (transactionType === "sale_reseller") {
      const resellerPrice = Number(selectedProduct.price?.reseller_sell_price) || 0;
      if (resellerPrice <= 0 && unitPrice <= 0) {
        setErrorMsg("Harga reseller belum diatur untuk tanggal ini. Update harga dulu sebelum transaksi reseller.");
        return;
      }
    }

    if (unitPrice <= 0) {
      setErrorMsg("Harga satuan barang tidak boleh Rp 0.");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === selectedProduct.id && item.unitPrice === unitPrice);
      if (existing) {
        return prev.map(item => 
          item.productId === selectedProduct.id && item.unitPrice === unitPrice 
            ? { ...item, qty: item.qty + qty, isManualPrice: item.isManualPrice || isManualPrice } 
            : item
        );
      }
      return [...prev, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        code: selectedProduct.item_code,
        weight: selectedProduct.weight,
        unit: selectedProduct.unit,
        unitPrice,
        qty,
        isManualPrice
      }];
    });

    setSelectedProductId("");
    setQtyStr("1");
    setCustomPriceStr("");
    setErrorMsg("");
    setWarningMsg("");
    setRequiresLossOverride(false);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    setWarningMsg("");
    setRequiresLossOverride(false);
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const amountPaid = amountPaidStr === "" ? totalAmount : (parseInt(amountPaidStr.replace(/\D/g, "")) || 0);

  const hasManualPriceInCart = useMemo(() => {
    return cart.some(item => item.isManualPrice);
  }, [cart]);

  // Determine if PIN Owner is required
  const needsOwnerPin = isDeepBackdated || hasManualPriceInCart || requiresLossOverride;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg("Keranjang masih kosong");
      return;
    }

    if (!customerId && !customerName) {
      setErrorMsg("Pilih atau isi nama customer");
      return;
    }

    if (!customerPhone || customerPhone.trim() === "") {
      setErrorMsg("Nomor WhatsApp wajib diisi");
      return;
    }

    if (isBackdated && (!backdateReason || backdateReason.trim() === "")) {
      setErrorMsg("Alasan transaksi susulan wajib diisi.");
      return;
    }

    // Validasi harga reseller di keranjang
    if (transactionType === "sale_reseller") {
      for (const item of cart) {
        if (!item.unitPrice || item.unitPrice <= 0) {
          setErrorMsg(`Harga reseller untuk barang "${item.name}" belum valid. Update harga dulu sebelum transaksi reseller.`);
          return;
        }
      }
    }

    // Jika membutuhkan otorisasi PIN Owner
    if (needsOwnerPin) {
      setOwnerPin("");
      setOwnerPinError("");
      setAuthModalOpen(true);
      return;
    }

    setIsPending(true);
    setErrorMsg("");
    
    try {
      const validation = await validateCart(cart);
      if (validation.hasInsufficientStock) {
        throw new Error("Stok tidak mencukupi untuk beberapa barang di keranjang.");
      }

      const payload = {
        customerId: customerId === "new" ? null : customerId,
        customerName,
        customerPhone,
        transactionType,
        items: cart,
        amountPaid,
        paymentMethod,
        notes,
        transactionDate,
        backdateReason: isBackdated ? backdateReason.trim() : null,
        manualPriceOverride: hasManualPriceInCart,
        priceSourceDate: hasManualPriceInCart ? null : transactionDate
      };

      const res = await checkout(payload, false);
      if (res.error) throw new Error(res.error);

      router.push(`/invoice/${res.transactionId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsPending(false);
    }
  };

  const handleConfirmAuthModal = async () => {
    if (!ownerPin || ownerPin.trim() === "") {
      setOwnerPinError("PIN Owner wajib diisi untuk otorisasi.");
      return;
    }

    setIsPending(true);
    setOwnerPinError("");
    setErrorMsg("");
    
    try {
      const validation = await validateCart(cart);
      if (validation.hasInsufficientStock) {
        throw new Error("Stok tidak mencukupi untuk beberapa barang di keranjang.");
      }

      const payload = {
        customerId: customerId === "new" ? null : customerId,
        customerName,
        customerPhone,
        transactionType,
        items: cart,
        amountPaid,
        paymentMethod,
        notes,
        transactionDate,
        backdateReason: isBackdated ? backdateReason.trim() : null,
        manualPriceOverride: hasManualPriceInCart,
        priceSourceDate: hasManualPriceInCart ? null : transactionDate
      };

      const res = await checkout(payload, true, ownerPin);
      if (res.error) throw new Error(res.error);

      setAuthModalOpen(false);
      setOwnerPin("");
      router.push(`/invoice/${res.transactionId}`);
    } catch (err: any) {
      setOwnerPinError(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Notice / Missing Price Warning */}
      {isBackdated && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-800">
              Transaksi Susulan (Tanggal: {new Date(transactionDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })})
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Ini transaksi susulan. Invoice akan masuk ke laporan sesuai tanggal transaksi, bukan tanggal input.
              {isDeepBackdated && " Transaksi lebih dari 1 hari lalu mewajibkan otorisasi PIN Owner."}
            </p>
          </div>
        </div>
      )}

      {!isBackdated && hasMissingDatePrice && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-800">Peringatan: Harga Belum Di-Update Hari Ini</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Beberapa produk menggunakan harga aktif terakhir dari hari sebelumnya. Pastikan harga tersebut masih valid sebelum memproses transaksi.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane - Inputs */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <Card className="rounded-2xl border-none ring-1 ring-slate-200 shadow-sm pt-0 overflow-hidden shrink-0">
            <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
              <CardTitle className="text-lg text-white">Data Pelanggan &amp; Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              
              {/* Tanggal Transaksi & Transaksi Susulan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-[#294376]" />
                    Tanggal Transaksi
                  </Label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={transactionDate} 
                      max={todayStr} 
                      onChange={e => handleDateChange(e.target.value)} 
                      className={`h-11 font-medium ${isBackdated ? "border-amber-300 bg-amber-50/50 text-amber-900" : ""}`}
                    />
                    {isLoadingDatePrices && (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400 absolute right-3 top-3.5" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipe Transaksi</Label>
                  <Select value={transactionType} onValueChange={handleTransactionTypeChange} items={[{value:'sale_general',label:'Penjualan Umum'},{value:'sale_reseller',label:'Penjualan Reseller'}]}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale_general">Penjualan Umum</SelectItem>
                      <SelectItem value="sale_reseller">Penjualan Reseller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alasan Transaksi Susulan (Wajib jika backdated) */}
              {isBackdated && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <Label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    Alasan Transaksi Susulan <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={backdateReason} 
                    onChange={e => setBackdateReason(e.target.value)} 
                    placeholder="Wajib diisi: Misal nota offline kemarin belum sempat diinput kasir" 
                    className="border-amber-300 focus:border-amber-500 bg-white"
                    required
                  />
                  {isDeepBackdated && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      * Karena mundur lebih dari 1 hari, otorisasi PIN Owner akan diminta saat konfirmasi transaksi.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pilih Customer</Label>
                  <Select value={customerId} onValueChange={handleCustomerSelect} items={[{value:'new',label:'+ Customer Baru (Ketik Manual)'}, ...customers.map(c => ({value: c.id, label: `${c.name} ${c.customer_type === 'reseller' ? '(Reseller)' : ''}`.trim()}))]}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="-- Ketik / Pilih Customer --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Customer Baru (Ketik Manual)</SelectItem>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} {c.customer_type === 'reseller' ? '(Reseller)' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nomor WhatsApp (Wajib)</Label>
                  <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="08xxx..." className="h-11" required />
                </div>
              </div>

              {customerId === "new" && (
                <div className="p-4 bg-muted/30 rounded-xl border space-y-2">
                  <Label>Nama Customer Baru</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama Lengkap Customer" className="h-11 bg-white" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Picker */}
          <Card className="rounded-2xl border-none ring-1 ring-slate-200 shadow-sm pt-0 overflow-hidden flex-1 flex flex-col">
            <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0 shrink-0">
              <CardTitle className="text-lg text-white">Pilih Produk</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Produk</Label>
                  <div>
                    <Select value={selectedProductId} onValueChange={handleProductSelect} items={[...currentProducts].sort((a,b) => (a.name||'').localeCompare(b.name||'')).map(p => {
                      const titleName = p.name ? p.name.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase()) : "";
                      return {value: p.id, label: `${titleName} (${p.weight} ${p.unit}) - [Kode: ${p.item_code}]`};
                    })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="-- Pilih Produk --" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...currentProducts].sort((a,b) => (a.name||'').localeCompare(b.name||'')).map(p => {
                          const titleName = p.name ? p.name.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase()) : "";
                          const hasPrice = p.price && (transactionType === "sale_reseller" ? p.price.reseller_sell_price > 0 : p.price.retail_sell_price > 0);
                          return (
                            <SelectItem key={p.id} value={p.id}>
                              {titleName} ({p.weight}{p.unit}) {!hasPrice ? "- (Harga Belum Ada pada Tanggal Ini)" : ""} - [Kode: {p.item_code}]
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Qty</Label>
                  <Input type="number" min="1" value={qtyStr} onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    setQtyStr(val ? parseInt(val, 10).toString() : "");
                  }} className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label>Harga Satuan (Rp) - Bisa Diubah Manual</Label>
                  <Input 
                    value={customPriceStr !== "" ? customPriceStr : (selectedProductId && defaultPrice > 0 ? formatRupiah(defaultPrice) : "")} 
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setCustomPriceStr(digits ? formatRupiah(parseInt(digits, 10)) : "");
                    }}
                    placeholder={isPriceMissingForDate ? "Input harga manual (Otorisasi Owner)" : "Harga Otomatis / Wajib Diisi"}
                    className={`h-11 ${isPriceMissingForDate ? "border-red-300 bg-red-50/30" : ""}`}
                  />
                </div>
              </div>

              {/* Warning jika harga belum ada untuk tanggal transaksi */}
              {selectedProduct && isPriceMissingForDate && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2.5 mb-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <strong>Harga Tidak Tersedia pada Tanggal {transactionDate}:</strong>
                    <p className="mt-0.5 leading-relaxed">
                      Harga untuk tanggal transaksi ini belum tersedia. Update harga tanggal tersebut atau input harga manual dengan otorisasi owner.
                    </p>
                  </div>
                </div>
              )}

              {transactionType === "sale_reseller" && selectedProduct && !isPriceMissingForDate && (!selectedProduct.price?.reseller_sell_price || Number(selectedProduct.price.reseller_sell_price) <= 0) && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-xs flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span><strong>Perhatian:</strong> Harga reseller belum diatur di tanggal ini. Update harga dulu sebelum transaksi reseller.</span>
                </div>
              )}
              
              <div className="mt-auto pt-4">
                <Button onClick={addToCart} size="lg" className="w-full font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm">
                  <Plus className="mr-2 h-5 w-5" /> Tambah ke Keranjang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - Cart & Checkout */}
        <div className="flex flex-col h-full">
          <Card className="flex flex-col flex-1 rounded-2xl border-none ring-1 ring-slate-200 shadow-sm overflow-hidden pt-0">
            <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                Keranjang <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-sm">{cart.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0 bg-slate-50/30">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Keranjang masih kosong
                </div>
              ) : (
                <ul className="divide-y">
                  {cart.map((item, idx) => (
                    <li key={idx} className="p-4 flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          {item.name}
                          {item.isManualPrice && (
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200">
                              Harga Manual
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.code} • {item.qty} pcs x Rp {formatRupiah(item.unitPrice)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-medium text-sm">Rp {formatRupiah(item.qty * item.unitPrice)}</div>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeFromCart(idx)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <div className="p-4 bg-muted/20 border-t space-y-4">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total Tagihan</span>
                <span>Rp {formatRupiah(totalAmount)}</span>
              </div>

              <div className="space-y-2">
                <Label>Nominal Pembayaran (Rp)</Label>
                <Input 
                  className={`font-medium placeholder:text-sm placeholder:italic placeholder:font-normal ${amountPaidStr ? 'text-right' : 'text-left'}`}
                  value={amountPaidStr ? formatRupiah(parseInt(amountPaidStr)) : ""}
                  onChange={e => setAmountPaidStr(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nominal yang dibayarkan"
                />
              </div>

              {totalAmount - amountPaid > 0 && (
                <div className="flex justify-between items-center text-sm text-red-600 font-medium">
                  <span>Sisa Kurang</span>
                  <span>Rp {formatRupiah(totalAmount - amountPaid)}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v || "cash")}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Pilih Metode">
                      {paymentMethod === 'cash' ? 'Tunai (Cash)' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'Pilih Metode'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai (Cash)</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catatan Invoice (Opsional)</Label>
                <Input 
                  className="placeholder:text-sm placeholder:italic placeholder:font-normal"
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Misal: Titip simpan / Transaksi khusus" 
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {errorMsg}
                </div>
              )}

              <Button size="lg" className="w-full font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors mt-2 shadow-sm" onClick={handleCheckout} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Simpan Transaksi"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Owner Authorization Dialog (Backdate > 1 day / Loss / Manual Price) */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center justify-center gap-2 text-xl font-bold">
              <ShieldCheck className="h-6 w-6" />
              Otorisasi PIN Owner Diperlukan
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-sm text-slate-600">
              Transaksi ini memerlukan otorisasi dari <strong>Owner</strong> karena faktor berikut:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-4 rounded-xl border text-sm space-y-3 mt-2 mx-2">
            <p className="font-semibold text-slate-700">Faktor Otorisasi:</p>
            <ul className="space-y-2 text-xs">
              {isDeepBackdated && (
                <li className="flex items-start gap-2 text-amber-800 font-medium">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Transaksi Susulan:</strong> Mundur {diffDays} hari dari hari ini (Tanggal: {transactionDate}).</span>
                </li>
              )}
              {hasManualPriceInCart && (
                <li className="flex items-start gap-2 text-blue-800 font-medium">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Harga Manual:</strong> Produk menggunakan harga manual karena harga pada tanggal tersebut belum diatur.</span>
                </li>
              )}
              {requiresLossOverride && (
                <li className="flex items-start gap-2 text-red-700 font-medium">
                  <span className="text-red-500 font-bold">•</span>
                  <span><strong>Potensi Jual Rugi:</strong> Harga jual di bawah modal batch masuk.</span>
                </li>
              )}
            </ul>

            {warningDetails.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <p className="font-semibold text-slate-700 text-xs mb-1">Rincian Potensi Rugi:</p>
                <ul className="space-y-1 text-xs">
                  {warningDetails.map((detail, idx) => (
                    <li key={idx} className="text-slate-600">
                      • {detail.name}: <span className="text-red-600 font-semibold">{detail.lossQty} pcs modal lebih tinggi</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-2 px-2">
            <Label className="text-xs font-semibold text-slate-700">
              Masukkan PIN Owner <span className="text-red-500">*</span>
            </Label>
            <Input 
              type="password" 
              maxLength={10} 
              placeholder="Masukkan PIN Owner" 
              value={ownerPin} 
              onChange={e => { setOwnerPin(e.target.value); setOwnerPinError(""); }}
              className="text-center font-bold tracking-widest text-lg h-11 border-red-300 focus:border-red-500 bg-white"
            />
            {ownerPinError && (
              <p className="text-xs text-red-600 font-semibold text-center">{ownerPinError}</p>
            )}
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-3 sm:justify-center px-6 pb-6 border-none bg-transparent">
            <Button variant="outline" onClick={() => setAuthModalOpen(false)} disabled={isPending} className="w-full sm:w-32 rounded-full h-11 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm">
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmAuthModal} 
              disabled={isPending || !ownerPin}
              className="w-full sm:w-auto rounded-full h-11 bg-red-600 text-white hover:bg-red-700 font-semibold shadow-sm"
            >
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Otorisasi &amp; Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
