"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { validateCart, checkout } from "@/app/(dashboard)/buat-invoice/actions";
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

export function PosClient({ products, customers, hasMissingTodayPrice }: PosClientProps) {
  const router = useRouter();
  
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
  const [requiresOverride, setRequiresOverride] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningDetails, setWarningDetails] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    if (cart.length === 0) {
      setWarningDetails([]);
      setRequiresOverride(false);
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
        setRequiresOverride(true);
      } else {
        setWarningDetails([]);
        setRequiresOverride(false);
      }
    });
    return () => { active = false; };
  }, [cart]);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const defaultPrice = useMemo(() => {
    if (!selectedProduct || !selectedProduct.price) return 0;
    return transactionType === "sale_reseller" 
      ? 0 
      : selectedProduct.price.retail_sell_price;
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
    if (val) setSelectedProductId(val);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0) return;

    let unitPrice = defaultPrice;
    if (customPriceStr) {
      const parsed = parseInt(customPriceStr.replace(/\D/g, ""));
      if (!isNaN(parsed)) unitPrice = parsed;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === selectedProduct.id && item.unitPrice === unitPrice);
      if (existing) {
        return prev.map(item => 
          item.productId === selectedProduct.id && item.unitPrice === unitPrice 
            ? { ...item, qty: item.qty + qty } 
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
        qty
      }];
    });

    setSelectedProductId("");
    setQtyStr("1");
    setCustomPriceStr("");
    setWarningMsg("");
    setRequiresOverride(false);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    setWarningMsg("");
    setRequiresOverride(false);
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const amountPaid = amountPaidStr === "" ? totalAmount : (parseInt(amountPaidStr.replace(/\D/g, "")) || 0);

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

    setIsPending(true);
    setErrorMsg("");
    
    try {
      // If there might be warnings, validate first and show modal
      if (requiresOverride) {
        setIsPending(false);
        setWarningModalOpen(true);
        return;
      }
      
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
        notes
      };

      const res = await checkout(payload, false);
      if (res.error) throw new Error(res.error);

      // Success, redirect to invoice
      router.push(`/invoice/${res.transactionId}`);

    } catch (err: any) {
      setErrorMsg(err.message);
      setIsPending(false);
    }
  };

  const handleConfirmOverride = async () => {
    setWarningModalOpen(false);
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
        notes
      };

      const res = await checkout(payload, true); // true for overrideFlag
      if (res.error) throw new Error(res.error);

      // Success, redirect to invoice
      router.push(`/invoice/${res.transactionId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasMissingTodayPrice && (
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
            <CardTitle className="text-lg text-white">Data Pelanggan & Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pilih Customer</Label>
                <Select value={customerId} onValueChange={handleCustomerSelect} items={[{value:'new',label:'+ Customer Baru (Ketik Manual)'}, ...customers.map(c => ({value: c.id, label: `${c.name} ${c.customer_type === 'reseller' ? '(Reseller)' : ''}`.trim()}))]}>
                  <SelectTrigger>
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
                <Label>Tipe Transaksi</Label>
                <Select value={transactionType} onValueChange={handleTransactionTypeChange} items={[{value:'sale_general',label:'Penjualan Umum'},{value:'sale_reseller',label:'Penjualan Reseller'}]}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale_general">Penjualan Umum</SelectItem>
                    <SelectItem value="sale_reseller">Penjualan Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {customerId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border">
                {customerId === "new" ? (
                  <div className="space-y-2">
                    <Label>Nama Customer Baru</Label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama Lengkap" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Nama Customer</Label>
                    <Input value={customerName} disabled className="bg-slate-50 text-slate-500" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Nomor WhatsApp (Wajib)</Label>
                  <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="08xxx..." required />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none ring-1 ring-slate-200 shadow-sm pt-0 overflow-hidden flex-1 flex flex-col">
          <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0 shrink-0">
            <CardTitle className="text-lg text-white">Pilih Produk</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4 flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Produk</Label>
                <div>
                  <Select value={selectedProductId} onValueChange={handleProductSelect} items={[...products].sort((a,b) => (a.name||'').localeCompare(b.name||'')).map(p => {
                    const titleName = p.name ? p.name.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase()) : "";
                    return {value: p.id, label: `${titleName} (${p.weight} ${p.unit}) - [Kode: ${p.item_code}]`};
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Pilih Produk --" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...products].sort((a,b) => (a.name||'').localeCompare(b.name||'')).map(p => {
                        const titleName = p.name ? p.name.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase()) : "";
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            {titleName} ({p.weight}{p.unit}) {p.price ? "" : "- (Harga Belum Diatur)"} - [Kode: {p.item_code}]
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
                }} />
              </div>

              <div className="space-y-2">
                <Label>Harga Satuan (Rp) - Bisa Diubah Manual</Label>
                <Input 
                  value={customPriceStr !== "" ? customPriceStr : (selectedProductId && defaultPrice > 0 ? formatRupiah(defaultPrice) : "")} 
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setCustomPriceStr(digits ? formatRupiah(parseInt(digits, 10)) : "");
                  }}
                  placeholder="Harga Otomatis / Wajib Diisi"
                />
              </div>
            </div>
            
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
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.code} • {item.qty} pcs x Rp {formatRupiah(item.unitPrice)}</div>
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
              <span>Total</span>
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
                placeholder="Misal: Titip simpan" 
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

    {/* Jual Rugi Warning Dialog */}
    <Dialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center justify-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6" />
            Peringatan Jual Rugi!
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            Harga jual beberapa produk lebih rendah dari modal aslinya. Apakah Anda yakin ingin memproses transaksi ini?
          </DialogDescription>
        </DialogHeader>

        {warningDetails.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border text-sm space-y-3 mt-2 mx-2">
            <p className="font-semibold text-slate-700">Rincian Potensi Rugi:</p>
            <ul className="space-y-3">
              {warningDetails.map((detail, idx) => (
                <li key={idx} className="border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                  <span className="font-bold block mb-1 text-slate-800">{detail.name}</span>
                  {detail.profitQty > 0 && (
                    <div className="flex items-start text-emerald-600">
                      <span>• {detail.profitQty} pcs aman dijual (Untung)</span>
                    </div>
                  )}
                  {detail.lossQty > 0 && (
                    <div className="flex items-start text-red-600 font-semibold mt-1">
                      <span>• {detail.lossQty} pcs harga modal lebih tinggi (Rugi)</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-3 sm:justify-center px-6 pb-6 border-none bg-transparent">
          <Button variant="outline" onClick={() => setWarningModalOpen(false)} disabled={isPending} className="w-full sm:w-32 rounded-full h-11 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm">
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirmOverride} 
            disabled={isPending}
            className="w-full sm:w-auto rounded-full h-11 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 font-semibold shadow-sm"
          >
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Ya, Tetap Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
