"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  Award,
  Gem,
  Coins
} from "lucide-react";
import { StorefrontProduct } from "@/lib/storefront-data";

interface HeroSectionProps {
  featuredGold?: StorefrontProduct | null;
  featuredSilver?: StorefrontProduct | null;
  gold10gPrice?: number;
  dinarPrice?: number;
}

export function HeroSection({
  featuredGold,
  featuredSilver,
  gold10gPrice = 25990000,
  dinarPrice = 159000,
}: HeroSectionProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const actualGoldPrice = featuredGold?.retail_price || gold10gPrice;
  const actualGoldName = featuredGold?.name || "ANTAM 10 Gram";
  const actualGoldLink = featuredGold ? `/katalog/${featuredGold.id}` : "/katalog/10g";

  const actualSilverPrice = featuredSilver?.retail_price || dinarPrice;
  const actualSilverName = featuredSilver?.name || "1 DIRHAM ABA";
  const actualSilverWeight = featuredSilver ? `${featuredSilver.weight}g` : "3.11g";

  return (
    <section className="pt-28 sm:pt-36 lg:pt-32 pb-8 sm:pb-12 max-w-[1360px] mx-auto px-3.5 sm:px-8">
      <div className="relative bg-[#1b355a] rounded-2xl sm:rounded-3xl p-5 sm:p-10 lg:p-12 text-white shadow-2xl overflow-hidden border border-[#26446e]">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#274a7a] rounded-full blur-3xl pointer-events-none opacity-60"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Hero Copy & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start gap-3.5 sm:gap-5">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#24426d] border border-[#3b5d8d] shadow-sm max-w-full">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider truncate">
                Sertifikasi Standar SNI 8887 &amp; Akreditasi LBMA
              </span>
            </div>

            {/* Main Luxury Heading with text-balance to avoid orphaned words */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-snug sm:leading-tight tracking-tight text-balance">
              Investasi Logam Mulia &amp; Koleksi{" "}
              <span className="text-[#fed65b] italic font-serif">Emas &amp; Perak</span>{" "}
              Eksklusif
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal text-balance">
              Amankan masa depan finansial keluarga Anda dengan emas murni batangan bersertifikat resmi 99.99% (24 Karat) dan koin dirham syariah. Transaksi transparan, garansi buyback harian, dan jaminan keaslian seumur hidup.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto pt-1 sm:pt-2">
              <a
                href="#katalog"
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#d99b00] to-[#f2ca50] hover:from-[#c68a00] hover:to-[#e2b83a] text-[#1a1200] font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <Gem className="w-4 h-4 flex-shrink-0" />
                <span>Eksplorasi Katalog Emas &amp; Perak</span>
              </a>

              <a
                href="#kalkulator"
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#274570] hover:bg-[#315384] text-white border border-[#3e6293] font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Cek Harga &amp; Simulasi</span>
              </a>
            </div>

            {/* Micro Trust Pills */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-6 pt-1 sm:pt-3 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">100% Segel Tamper-Evident</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">Jaminan Likuiditas Buyback</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">Pengiriman Berasuransi Penuh</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card Mosaic */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Featured 10g Ingot Card */}
            <Link
              href={actualGoldLink}
              className="group block bg-white rounded-2xl p-5 shadow-xl border border-slate-100 text-slate-900 transition-all duration-300 hover:shadow-2xl hover:border-amber-400/40"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-[#b47a00] uppercase tracking-wider">
                  Produk Terlaris Hari Ini
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  999.9 • 24K
                </span>
              </div>

              {/* Ingot Visual Frame */}
              <div className="relative h-64 w-full rounded-xl overflow-hidden mb-4 bg-gradient-to-b from-slate-900 via-[#101935] to-slate-950 flex items-center justify-center p-3 border border-slate-800">
                <img
                  src={featuredGold?.image_url || "/images/products/antam_certicard.jpg"}
                  alt={actualGoldName}
                  className="h-full w-auto max-w-full object-contain rounded-lg transform group-hover:scale-105 transition-transform duration-500 shadow-2xl"
                />

                <div className="absolute bottom-3 left-3 bg-[#1b355a]/90 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-semibold text-amber-300 border border-amber-400/20 shadow">
                  Kemasan CertiCard Resmi
                </div>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#b47a00] transition-colors flex items-center gap-1">
                    {actualGoldName}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Nomor Seri Terekam • Sertifikat QR Hologram
                  </p>
                </div>
                <div className="xs:text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Harga Hari Ini
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#1b355a]">
                    {formatRupiah(actualGoldPrice)}
                  </div>
                </div>
              </div>
            </Link>

            {/* Mini Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between text-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#b47a00] tracking-wider">
                    Koin Syariah
                  </span>
                  <Coins className="w-4 h-4 text-[#d99b00]" />
                </div>
                <div className="text-sm font-bold text-slate-800">{actualSilverName} ({actualSilverWeight})</div>
                <div className="text-xs font-bold text-[#1b355a] mt-1">
                  {formatRupiah(actualSilverPrice)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between text-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    Garansi Buyback
                  </span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-slate-800">Cair Hari Ini</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">
                  Spread Transparan
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
