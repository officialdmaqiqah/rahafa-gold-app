"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { Printer, Download, MessageCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface InvoicePrintClientProps {
  transaction: any;
  items: any[];
  settings?: any;
}

export function InvoicePrintClient({ transaction, items, settings }: InvoicePrintClientProps) {
  const router = useRouter();
  
  const storeName = settings?.store_name || "RAHAFA";
  const tagline = settings?.tagline || "EMAS & SILVER";
  const phone = settings?.phone || "0853-8410-9496";
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

      {/* Invoice Paper */}
      <div className="bg-white p-8 md:p-12 border shadow-lg print:shadow-none print:border-none print:p-0 text-black">
        
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

        {/* Table */}
        <div className="mb-8 overflow-hidden rounded border border-gray-300">
          <table className="w-full text-left text-sm">
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
