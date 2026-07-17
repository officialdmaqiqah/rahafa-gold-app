"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { checkoutBuyback } from "@/app/(dashboard)/buyback/actions";
import { formatRupiah } from "@/lib/utils";

interface BuybackClientProps {
  products: any[];
  customers: any[];
}

export function BuybackClient({ products, customers }: BuybackClientProps) {
  const router = useRouter();
  
  // Transaction State
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amountPaidStr, setAmountPaidStr] = useState("");
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

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const defaultPrice = useMemo(() => {
    return 0; // Buyback price entered manually
  }, [selectedProduct]);

  const handleCustomerSelect = (val: string | null) => {
    if (!val) return;
    setCustomerId(val);
    const cust = customers.find(c => c.id === val);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || "");
    } else {
      setCustomerName("");
      setCustomerPhone("");
    }
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

    if (unitPrice <= 0) {
      setErrorMsg("Harga buyback tidak boleh 0");
      return;
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
    setErrorMsg("");
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    setErrorMsg("");
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);

  // Default amount paid to totalAmount
  const currentPaidStr = amountPaidStr ? amountPaidStr : totalAmount.toString();
  const amountPaid = parseInt(currentPaidStr.replace(/\D/g, "")) || 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg("Keranjang masih kosong");
      return;
    }

    if (!customerId && !customerName) {
      setErrorMsg("Pilih atau isi nama penjual");
      return;
    }

    if (!customerPhone || customerPhone.trim() === "") {
      setErrorMsg("Nomor WhatsApp wajib diisi");
      return;
    }

    setIsPending(true);
    setErrorMsg("");
    
    try {
      const payload = {
        customerId: customerId === "new" ? null : customerId,
        customerName,
        customerPhone,
        items: cart,
        totalPaid: amountPaid,
        notes
      };

      const res = await checkoutBuyback(payload);
      if (res.error) throw new Error(res.error);

      // Success, redirect to invoice
      router.push(`/buyback/${res.transactionId}`);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Pane - Inputs */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-full">
        <Card className="rounded-2xl border-none ring-1 ring-slate-200 shadow-sm pt-0 overflow-hidden shrink-0">
          <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
            <CardTitle className="text-lg text-white">Data Pelanggan & Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pilih Penjual</Label>
                <Select value={customerId} onValueChange={handleCustomerSelect} items={[{value:'new',label:'+ Penjual Baru (Ketik Manual)'}, ...customers.map(c => ({value: c.id, label: c.name}))]}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Ketik / Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Penjual Baru (Ketik Manual)</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {customerId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border">
                {customerId === "new" ? (
                  <div className="space-y-2">
                    <Label>Nama Penjual Baru</Label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama Lengkap" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Nama Penjual</Label>
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
                            {titleName} ({p.weight}{p.unit}) - [Kode: {p.item_code}]
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
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <Label>Harga Beli Satuan (Rp) - Wajib Diisi</Label>
                </div>
                <Input 
                  value={customPriceStr !== "" ? customPriceStr : (selectedProductId && defaultPrice > 0 ? formatRupiah(defaultPrice) : "")} 
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setCustomPriceStr(digits ? formatRupiah(parseInt(digits, 10)) : "");
                  }}
                  placeholder="Wajib Diisi"
                />
              </div>
            </div>
            <div className="mt-auto pt-4">
              <Button onClick={addToCart} size="lg" disabled={!selectedProductId} className="w-full font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm">
                <Plus className="mr-2 h-5 w-5" /> Tambah Barang
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
              Keranjang Buyback <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cart.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0 bg-slate-50/30">
            {cart.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Daftar masih kosong
              </div>
            ) : (
              <ul className="divide-y">
                {cart.map((item, idx) => (
                  <li key={idx} className="p-4 flex justify-between items-start bg-blue-50/30">
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
            <div className="flex justify-between items-center font-bold text-lg text-blue-700">
              <span>Total Buyback</span>
              <span>Rp {formatRupiah(totalAmount)}</span>
            </div>

            <div className="space-y-2">
              <Label>Uang yang Dibayarkan (Rp)</Label>
              <Input 
                className="text-right"
                value={amountPaidStr !== "" ? amountPaidStr : (cart.length > 0 ? formatRupiah(totalAmount) : "")}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setAmountPaidStr(digits ? formatRupiah(parseInt(digits, 10)) : "");
                }}
                placeholder="Jumlah bayar ke pelanggan"
              />
            </div>

            <div className="space-y-2">
              <Label>Catatan / Kondisi Barang</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Misal: Kondisi mulus, nota lengkap" />
            </div>

            {errorMsg && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {errorMsg}
              </div>
            )}

            <Button onClick={handleCheckout} size="lg" disabled={isPending || cart.length === 0} className="w-full h-14 font-bold text-lg rounded-xl shadow-md">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              {isPending ? "Memproses..." : "Simpan Proses Buyback"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
