"use client";

import { useRef, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, Download, MessageSquare, AlertCircle, AlertTriangle, ArrowLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { cancelBuyback } from "@/app/(dashboard)/buyback/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DEFAULT_STORE_PHONE } from "@/lib/constants";

export function BuybackPrintClient({ transaction, settings }: { transaction: any, settings?: any }) {
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelPin, setCancelPin] = useState("");

  const storeName = settings?.store_name || "RAHAFA";
  const tagline = settings?.tagline || "EMAS & SILVER";
  const logoUrl = settings?.logo_url || null;
  const storePhone = settings?.phone || DEFAULT_STORE_PHONE;

  const handlePrint = () => {
    window.print();
  };

  const handleWA = () => {
    const text = `*NOTA BUYBACK - ${storeName}*\nNo: ${transaction.transaction_number}\nTanggal: ${new Date(transaction.transaction_date).toLocaleDateString("id-ID")}\n\nTerima kasih Bapak/Ibu ${transaction.customers?.name} telah mempercayakan penjualan perhiasan/logam mulia kepada kami di ${storeName} (WA: ${storePhone}).\n\nTotal Pembayaran: Rp ${formatRupiah(transaction.total_amount)}\n\nKeterangan: ${transaction.notes || "-"}\n\nSemoga berkah selalu.`;
    const phone = transaction.customers?.phone;
    if (phone) {
      // format phone to 62...
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "62" + formattedPhone.substring(1);
      }
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert("Nomor WA pelanggan tidak tersedia.");
    }
  };

  const handleOpenCancel = () => {
    setCancelPin("");
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelPin || cancelPin.trim() === "") {
      setCancelError("PIN Owner wajib diisi untuk membatalkan buyback.");
      return;
    }
    setIsCancelling(true);
    setCancelError("");
    const res = await cancelBuyback(transaction.id, cancelPin);
    setIsCancelling(false);
    if (res?.error) {
      setCancelError(res.error);
    } else {
      setCancelModalOpen(false);
      setCancelPin("");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Actions (Not Printed) */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 print:hidden bg-blue-50/50 p-4 rounded-lg border border-blue-100">
        <Link href="/buyback">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handlePrint} className="bg-white">
            <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
          </Button>
          <Button variant="outline" onClick={handleWA} className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
            <MessageSquare className="mr-2 h-4 w-4" /> Kirim ke WA
          </Button>
          {transaction.status === "final" && (
            <Button variant="destructive" onClick={handleOpenCancel} disabled={isCancelling}>
              {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Batalkan Buyback
            </Button>
          )}
        </div>
      </div>
      
      {cancelError && (
        <div className="print:hidden p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          <AlertCircle className="inline-block mr-2 h-5 w-5" /> {cancelError}
        </div>
      )}
      
      {transaction.status === "cancelled" && (
        <div className="print:hidden p-4 bg-red-100 text-red-800 border border-red-300 rounded-md text-center font-bold">
          TRANSAKSI INI SUDAH DIBATALKAN
        </div>
      )}

      {/* Print Layout */}
      <div 
        ref={printRef}
        className="bg-white p-8 sm:p-12 border shadow-sm rounded-md mx-auto print:border-none print:shadow-none print:p-0 w-full max-w-3xl font-mono text-sm relative"
      >
        {transaction.status === "cancelled" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <span className="text-8xl font-bold text-red-600 rotate-45 border-8 border-red-600 p-8 rounded-3xl">DIBATALKAN</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-8">
          {logoUrl && (
            <img src={logoUrl} alt="Store Logo" className="h-16 object-contain mb-2" />
          )}
          <h1 className="text-3xl font-black tracking-tighter">{storeName}</h1>
          <h2 className="text-xl font-bold tracking-widest text-muted-foreground">{tagline}</h2>
          <p className="text-xs font-medium text-slate-700 mt-1">Telp / WA: {storePhone}</p>
        </div>

        <div className="text-center border-y-2 border-black py-2 mb-6">
          <h3 className="text-xl font-bold">NOTA BUYBACK / PEMBELIAN KEMBALI</h3>
        </div>

        {/* Meta */}
        <div className="flex justify-between mb-8">
          <div className="space-y-1">
            <div className="flex"><span className="w-24">No Nota</span><span>: {transaction.transaction_number}</span></div>
            <div className="flex"><span className="w-24">Tanggal</span><span>: {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}</span></div>
          </div>
          <div className="space-y-1 text-right">
            <div className="flex justify-end"><span className="w-24 text-left">Penjual</span><span>: {transaction.customers?.name || "-"}</span></div>
            <div className="flex justify-end"><span className="w-24 text-left">No. WA</span><span>: {transaction.customers?.phone || "-"}</span></div>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-8 hidden sm:table print:table">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-2 text-left">Nama Barang</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Harga Beli</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transaction.transaction_items?.map((item: any) => (
              <tr key={item.id}>
                <td className="py-3">
                  <div className="font-bold">{item.products?.name}</div>
                  <div className="text-xs text-muted-foreground">{item.products?.item_code} - {item.products?.weight}{item.products?.unit}</div>
                </td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatRupiah(item.unit_price)}</td>
                <td className="py-3 text-right">{formatRupiah(item.quantity * item.unit_price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={3} className="py-3 text-right">TOTAL PEMBAYARAN:</td>
              <td className="py-3 text-right text-lg">Rp {formatRupiah(transaction.total_amount)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Mobile View */}
        <div className="block sm:hidden print:hidden border-y-2 border-black mb-8 divide-y divide-gray-200">
          {transaction.transaction_items?.map((item: any) => (
            <div key={item.id} className="py-3">
              <div className="font-bold">{item.products?.name}</div>
              <div className="text-xs text-muted-foreground mb-1">{item.products?.item_code} - {item.products?.weight}{item.products?.unit}</div>
              <div className="flex justify-between items-center text-sm">
                 <div>{item.quantity} x {formatRupiah(item.unit_price)}</div>
                 <div className="font-bold text-base">Rp {formatRupiah(item.quantity * item.unit_price)}</div>
              </div>
            </div>
          ))}
          <div className="py-3 border-t-2 border-black font-bold flex justify-between items-center">
            <span>TOTAL PEMBAYARAN:</span>
            <span className="text-lg">Rp {formatRupiah(transaction.total_amount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <div className="mb-1 font-semibold">Metode Pembayaran:</div>
            <div>{transaction.payment_method === 'cash' ? 'Cash / Tunai' : 'Transfer Bank'}</div>
            {transaction.notes && (
              <div className="mt-4">
                <div className="font-semibold mb-1">Catatan/Kondisi:</div>
                <div className="p-2 border rounded-md border-dashed">{transaction.notes}</div>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="mb-16">Penerima (Kasir),</div>
            <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
            <div>RAHAFA GOLD</div>
          </div>
        </div>
        
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>Terima kasih telah mempercayakan perhiasan Anda kepada Rahafa Gold.</p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          div[ref="printRef"], div[ref="printRef"] * {
            visibility: visible;
          }
          div[ref="printRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: auto;  margin: 0mm; }
        }
      `}} />

      {/* Dialog Konfirmasi Batal Buyback dengan PIN Owner */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center justify-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6" />
              Otorisasi Pembatalan Buyback
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Yakin ingin membatalkan transaksi buyback ini? Stok yang masuk dari buyback ini akan dihapus. Masukkan <strong>PIN Owner</strong> untuk mengonfirmasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2 px-2">
            <Label className="text-xs font-semibold text-slate-700">
              PIN Owner <span className="text-red-500">*</span>
            </Label>
            <Input 
              type="password" 
              maxLength={10} 
              placeholder="Masukkan PIN Owner" 
              value={cancelPin} 
              onChange={e => { setCancelPin(e.target.value); setCancelError(""); }}
              className="text-center font-bold tracking-widest text-lg h-11 border-red-300 focus:border-red-500 bg-white"
            />
            {cancelError && (
              <p className="text-xs text-red-600 font-semibold text-center">{cancelError}</p>
            )}
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-3 sm:justify-center px-6 pb-6 border-none bg-transparent">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={isCancelling} className="w-full sm:w-32 rounded-full h-11 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm">
              Kembali
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancel} 
              disabled={isCancelling || !cancelPin}
              className="w-full sm:w-auto rounded-full h-11 bg-red-600 text-white hover:bg-red-700 font-semibold shadow-sm"
            >
              {isCancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Batalkan Buyback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
