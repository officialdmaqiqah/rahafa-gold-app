"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { Printer, Download, MessageCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { DEFAULT_STORE_PHONE } from "@/lib/constants";

interface InvoicePrintClientProps {
  transaction: any;
  items: any[];
  settings?: any;
}

export function InvoicePrintClient({ transaction, items, settings }: InvoicePrintClientProps) {
  const router = useRouter();
  
  const storeName = settings?.store_name || "RAHAFA";
  const tagline = settings?.tagline || "EMAS & SILVER";
  const phone = settings?.phone || DEFAULT_STORE_PHONE;
  const footerText = settings?.invoice_footer || "Barang yang sudah dibeli dapat dijual kembali sesuai dengan ketentuan toko.";
  const logoUrl = settings?.logo_url || null;

  const handlePrint = () => {
    window.print();
  };

  const handleWA = () => {
    if (!transaction.customer?.phone) {
      alert("Nomor WA Customer tidak tersedia.");
      return;
    }
    let custPhone = transaction.customer.phone.replace(/\D/g, "");
    if (custPhone.startsWith("0")) {
      custPhone = "62" + custPhone.slice(1);
    }
    
    const text = `Halo ${transaction.customer.name}, berikut adalah rincian tagihan Anda dari ${storeName} dengan No Invoice ${transaction.transaction_number}. Total: Rp ${formatRupiah(transaction.total_amount)}.`;
    const url = `https://wa.me/${custPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const tDate = new Date(transaction.transaction_date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      
      {/* Controls (Hidden on Print) */}
      <div className="flex flex-wrap justify-between gap-4 print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleWA}>
            <MessageCircle className="mr-2 h-4 w-4" /> Kirim WA
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
          </Button>
        </div>
      </div>

      {transaction.status === "cancelled" && (
        <div className="print:hidden p-4 bg-red-100 text-red-800 border border-red-300 rounded-md text-center font-bold text-base">
          INVOICE INI TELAH DIBATALKAN (VOID)
        </div>
      )}

      {/* Invoice Paper */}
      <div className="bg-white p-8 md:p-12 border shadow-lg print:shadow-none print:border-none print:p-0 text-black relative overflow-hidden">
        {/* Watermark DIBATALKAN for screen and print */}
        {transaction.status === "cancelled" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-10 select-none">
            <span className="text-6xl sm:text-8xl font-black text-red-600 rotate-[-30deg] border-8 border-red-600 p-8 rounded-3xl tracking-widest">
              DIBATALKAN
            </span>
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 border-b-2 border-black pb-6">
          {logoUrl && (
            <img src={logoUrl} alt="Store Logo" className="h-20 object-contain mb-4" />
          )}
          <h1 className="text-4xl font-bold tracking-tight">{storeName}</h1>
          <h2 className="text-xl font-semibold mt-1">{tagline}</h2>
          <p className="text-sm mt-2 text-gray-700">Pusat Jual Beli Emas & Perak Bangka Belitung</p>
          <p className="text-sm font-medium mt-1">Telp / WA: {phone}</p>
        </div>

        {/* Info */}
        <div className="flex flex-col md:flex-row justify-between mb-8 text-sm gap-6">
          <div className="space-y-1">
            <p><span className="font-semibold inline-block w-24">No Invoice</span>: {transaction.transaction_number}</p>
            <p><span className="font-semibold inline-block w-24">Tanggal</span>: {tDate}</p>
            {(transaction.is_backdated || transaction.notes?.includes("TRANSAKSI SUSULAN")) && (
              <div className="print:hidden text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 mt-1">
                <span className="font-semibold">Status: Transaksi Susulan</span> • Diinput pada: {new Date(transaction.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {transaction.backdate_reason && <span> (Alasan: {transaction.backdate_reason})</span>}
              </div>
            )}
            {transaction.status === "cancelled" && (
              <p>
                <span className="font-semibold inline-block w-24">Status</span>:{" "}
                <span className="font-bold text-red-600 px-2 py-0.5 bg-red-100 border border-red-300 rounded text-xs">
                  DIBATALKAN (VOID)
                </span>
              </p>
            )}
            {transaction.notes && (
              <p><span className="font-semibold inline-block w-24">Catatan</span>: {transaction.notes}</p>
            )}
          </div>
          <div className="space-y-1">
            <p><span className="font-semibold inline-block w-24">Pelanggan</span>: {transaction.customer?.name || "-"}</p>
            <p><span className="font-semibold inline-block w-24">No. WA</span>: {transaction.customer?.phone || "-"}</p>
            <p><span className="font-semibold inline-block w-24">Tipe</span>: {transaction.transaction_type === 'sale_reseller' ? 'Reseller' : 'Umum'}</p>
          </div>
        </div>

        {/* Table / List */}
        <div className="mb-8 overflow-hidden rounded border border-gray-300">
          {/* Desktop & Print View */}
          <table className="w-full text-left text-sm hidden sm:table print:table">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="py-2 px-3">Deskripsi Barang</th>
                <th className="py-2 px-3 text-center">Gramasi</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Harga Satuan</th>
                <th className="py-2 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3">
                    <span className="font-medium">{item.product.name}</span>
                    <br />
                    <span className="text-xs text-gray-500">{item.product.item_code}</span>
                  </td>
                  <td className="py-2 px-3 text-center">{item.product.weight} {item.product.unit}</td>
                  <td className="py-2 px-3 text-center">{item.quantity}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">Rp {formatRupiah(item.unit_price)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap font-medium">Rp {formatRupiah(item.unit_price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="block sm:hidden print:hidden divide-y divide-gray-200">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 text-sm">
                <div className="font-medium text-base mb-1">{item.product.name}</div>
                <div className="text-xs text-gray-500 mb-2">Kode: {item.product.item_code} | Gramasi: {item.product.weight} {item.product.unit}</div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-600">
                    {item.quantity} x Rp {formatRupiah(item.unit_price)}
                  </div>
                  <div className="font-semibold text-black">
                    Rp {formatRupiah(item.unit_price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between font-bold text-base pb-2 border-b border-gray-300">
              <span>Total Tagihan</span>
              <span>Rp {formatRupiah(transaction.total_amount)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>DP / Terbayar</span>
              <span>Rp {formatRupiah(transaction.amount_paid)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2">
              <span>Sisa Pembayaran</span>
              <span>Rp {formatRupiah(transaction.remaining_amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-16 pt-4 border-t border-gray-200 whitespace-pre-line">
          {transaction.payment_method === 'transfer' && settings?.bank_account_info && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left inline-block w-full max-w-sm text-gray-700">
              <span className="font-semibold block mb-1">Informasi Transfer Bank:</span>
              {settings.bank_account_info}
            </div>
          )}
          <p>Terima kasih telah berbelanja di {storeName}.</p>
          <p>{footerText}</p>
        </div>

      </div>
    </div>
  );
}
