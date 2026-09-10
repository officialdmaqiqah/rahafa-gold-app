"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  Lock, 
  MessageCircle, 
  RefreshCw, 
  Award, 
  ChevronRight,
  Gem
} from "lucide-react";
import { StorefrontProduct } from "@/lib/storefront-data";

interface ProductDetailViewProps {
  product: StorefrontProduct;
  relatedProducts: StorefrontProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [fulfillment, setFulfillment] = useState<"shipping" | "vault">("shipping");
  const [activeTab, setActiveTab] = useState<"specs" | "buyback" | "shipping">("specs");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const unitBuyPrice = product.total_price || product.retail_price;
  const unitBuybackPrice = product.buyback_price;
  const totalPrice = unitBuyPrice * quantity;
  const totalBuyback = unitBuybackPrice * quantity;
  const totalWeight = (product.weight * quantity).toFixed(product.weight < 1 ? 3 : 1);

  const isSilver = product.category === "silver";

  const getWaCheckoutLink = () => {
    const fulfillmentText = fulfillment === "shipping" ? "Pengiriman Berasuransi ke Alamat" : "Titip Simpan di Brankas Aman";
    const text = encodeURIComponent(
      `Halo Rahafa Gold, saya ingin memesan:\n` +
      `• Produk: ${product.name}\n` +
      `• Kode Item: ${product.item_code}\n` +
      `• Kategori/Tipe: ${product.type} (${product.weight} ${product.unit})\n` +
      `• Jumlah: ${quantity} keping (Total: ${totalWeight} ${product.unit})\n` +
      `• Total Harga Hari Ini: ${formatRupiah(totalPrice)}\n` +
      `• Metode Penyerahan: ${fulfillmentText}\n\n` +
      `Mohon dibantu nomor rekening pembayaran resmi dan prosesnya.`
    );
    return `https://wa.me/6285384109496?text=${text}`;
  };

  return (
    <main className="flex-1 max-w-[1360px] mx-auto px-3.5 sm:px-8 pt-28 sm:pt-36 lg:pt-32 pb-16 w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#1b355a] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href="/#katalog" className="hover:text-[#1b355a] transition-colors">
          Katalog {isSilver ? "Perak" : "Emas"}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[#1b355a] font-bold">{product.name}</span>
      </div>

      {/* 2-Column Product Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ================= LEFT COLUMN: Visuals & Spec Sheet ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Primary Showcase Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-amber-50 border border-amber-200 text-[#b47a00] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.type}
              </span>
              <span className="bg-[#1b355a] text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                {product.badge || (isSilver ? "Fine Silver 99.9%" : "999.9 Fine Gold")}
              </span>
            </div>

            {/* Large Bullion Visual Frame */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl bg-gradient-to-b from-slate-900 via-[#101935] to-slate-950 flex items-center justify-center p-6 border border-slate-800 shadow-inner overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-auto max-w-full object-contain rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />

              {/* Seal Tag Badge */}
              <div className="absolute bottom-4 left-4 bg-[#1b355a]/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold text-amber-300 border border-amber-400/30 shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Segel Keaslian Terverifikasi</span>
              </div>
            </div>

            {/* Angle Thumbnails */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="bg-slate-100 rounded-xl p-2 text-center text-xs font-bold text-slate-700 border-2 border-amber-400 cursor-pointer">
                Tampak Depan
              </div>
              <div className="bg-slate-50 hover:bg-slate-100 rounded-xl p-2 text-center text-xs font-medium text-slate-500 border border-slate-200 cursor-pointer">
                Segel Belakang
              </div>
              <div className="bg-slate-50 hover:bg-slate-100 rounded-xl p-2 text-center text-xs font-medium text-slate-500 border border-slate-200 cursor-pointer">
                Barcode / QR
              </div>
            </div>
          </div>

          {/* Technical Specifications Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d99b00]" />
              <span>Spesifikasi Teknis &amp; Sertifikasi Laboratorium</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Kadar Kemurnian</span>
                <strong className="text-[#1b355a]">{isSilver ? "Fine Silver 99.9%" : "99.99% Fine Gold (24K)"}</strong>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Berat Bersih</span>
                <strong className="text-slate-900">{product.weight} {product.unit}</strong>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Kategori &amp; Tipe</span>
                <strong className="text-slate-900">{product.type}</strong>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Kode Item Produk</span>
                <strong className="text-slate-900 font-mono">{product.item_code}</strong>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Standar Akreditasi</span>
                <strong className="text-slate-900">SNI 8887:2020 &amp; Akreditasi LBMA</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Commercial Engine ================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#b47a00] uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Koleksi Logam Mulia Resmi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1b355a]">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kode Item: <span className="font-mono font-bold text-slate-700">{product.item_code}</span> • Garansi buyback resmi seumur hidup di seluruh butik Rahafa Gold.
              </p>
            </div>

            {/* Transparent Dual-Valuation Price Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Harga Beli Hari Ini (1 Keping)
                  </span>
                  <div className="text-3xl font-black text-[#1b355a] font-sans mt-0.5">
                    {formatRupiah(unitBuyPrice)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Termasuk PPh 22 (0.25%) &amp; sertifikat resmi
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    Garansi Buyback
                  </span>
                  <div className="text-xl font-bold text-emerald-700 mt-0.5">
                    {formatRupiah(unitBuybackPrice)}
                  </div>
                  <span className="text-[10px] text-slate-400">Pencairan langsung</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Spread: <strong>{formatRupiah(unitBuyPrice - unitBuybackPrice)}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Likuiditas Terjamin
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Pilih Jumlah Keping
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all ${
                      quantity === qty
                        ? "bg-[#1b355a] text-white border-[#1b355a] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {qty} Keping
                  </button>
                ))}
              </div>
            </div>

            {/* Fulfillment Method Selector (Radio Cards) */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Metode Penyerahan / Fulfillment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setFulfillment("shipping")}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                    fulfillment === "shipping"
                      ? "border-[#1b355a] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className={`w-4 h-4 ${fulfillment === "shipping" ? "text-[#1b355a]" : "text-slate-400"}`} />
                    <span className="text-xs font-bold text-slate-900">Kirim Berasuransi</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Dikirim via kurir ekspedisi khusus dengan proteksi asuransi penuh 100%.
                  </p>
                </div>

                <div
                  onClick={() => setFulfillment("vault")}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                    fulfillment === "vault"
                      ? "border-[#1b355a] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className={`w-4 h-4 ${fulfillment === "vault" ? "text-[#1b355a]" : "text-slate-400"}`} />
                    <span className="text-xs font-bold text-slate-900">Titip Brankas Aman</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Disimpan aman di vault Rahafa Gold, dapat diambil kapan saja di butik resmi.
                  </p>
                </div>
              </div>
            </div>

            {/* Total Calculation Banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#b47a00] font-bold block">
                  Total Pesanan ({totalWeight} {product.unit}):
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1b355a] font-sans">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
              <div className="xs:text-right text-xs text-slate-500">
                <span>Estimasi Buyback:</span>
                <span className="block font-bold text-emerald-700">{formatRupiah(totalBuyback)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={getWaCheckoutLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d99b00] via-[#f2ca50] to-[#b38f26] hover:from-[#c68a00] hover:to-[#a27e1d] text-[#1a1200] font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pesan Sekarang via WhatsApp Resmi</span>
              </a>

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/6285384109496?text=${encodeURIComponent(`Halo Rahafa Gold, saya ingin tanya informasi produk ${product.name} (Kode: ${product.item_code}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors text-center"
                >
                  Tanya Konsultan Butik
                </a>
                <Link
                  href="/#cek-sertifikat"
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors text-center"
                >
                  Cek Sertifikat Terdaftar
                </Link>
              </div>
            </div>

            {/* Trust Badges Trio */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Kemurnian Teruji</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Sertifikat SNI &amp; LBMA</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Garansi Buyback Resmi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB NAVIGATION & DETAILED SECTIONS ================= */}
      <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-6">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "specs"
                ? "border-[#1b355a] text-[#1b355a]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Keamanan &amp; Autentikasi
          </button>
          <button
            onClick={() => setActiveTab("buyback")}
            className={`pb-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "buyback"
                ? "border-[#1b355a] text-[#1b355a]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Kebijakan Garansi Buyback
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "shipping"
                ? "border-[#1b355a] text-[#1b355a]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pengiriman &amp; Asuransi
          </button>
        </div>

        {activeTab === "specs" && (
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-base">Standar Akreditasi &amp; Segel Anti-Pemalsuan</h4>
            <p>
              Produk {product.name} dicetak resmi oleh produsen refiner terakreditasi (PT ANTAM Tbk / Refiner LBMA) dengan standar SNI 8887:2020. Rahafa Gold menjamin 100% keaslian fisik, kadar kemurnian, dan keutuhan segel CertiCard saat Anda bertransaksi di butik kami.
            </p>
            <p>
              Segel kemasan dilengkapi fitur pelindung tamper-evident. Jika kemasan pernah dibuka atau dimanipulasi, pola pengaman mikroskopis akan rusak sebagai indikator visual otomatis.
            </p>
          </div>
        )}

        {activeTab === "buyback" && (
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-base">Jaminan Pembelian Kembali (Buyback Guarantee)</h4>
            <p>
              Rahafa Gold berkomitmen membeli kembali produk emas batangan dan koin yang Anda beli dari kami dengan patokan harga resmi harian (Garansi Buyback Floor: {formatRupiah(unitBuybackPrice)}/keping).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Pencairan dapat dilakukan secara tunai di butik fisik atau transfer perbankan instan.</li>
              <li>Produk dengan segel utuh diterima langsung tanpa pemotongan biaya assay lebur.</li>
              <li>Proses verifikasi kasir rata-rata hanya memakan waktu 5-10 menit.</li>
            </ul>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-base">Pengiriman Khusus Bernilai Tinggi (100% Berasuransi)</h4>
            <p>
              Semua pesanan yang dikirimkan ke alamat Anda dilindungi oleh polis asuransi bernilai tinggi penuh 100%. Kemasan luar dikirim dalam amplop keamanan berlabel netral untuk menjaga privasi Anda.
            </p>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold font-serif text-[#1b355a] mb-6">
            Pilihan Produk {isSilver ? "Perak" : "Emas"} Lainnya
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/katalog/${rel.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400/50 hover:shadow-lg transition-all group block"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span>{rel.type}</span>
                  <span>{rel.weight} {rel.unit}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#b47a00] transition-colors">
                  {rel.name}
                </h4>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Harga Hari Ini:</span>
                  <strong className="text-[#1b355a] font-sans text-sm">{formatRupiah(rel.total_price)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
