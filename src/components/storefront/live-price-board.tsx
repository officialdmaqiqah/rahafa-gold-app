"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  MessageCircle,
  BarChart3,
  Layers
} from "lucide-react";
import { StorefrontProduct } from "@/lib/storefront-data";

interface LivePriceBoardProps {
  products?: StorefrontProduct[];
  baseBuyPerGram?: number;
  baseBuybackPerGram?: number;
  lastUpdatedText?: string;
}

export function LivePriceBoard({
  products = [],
  baseBuyPerGram = 2818000,
  baseBuybackPerGram = 2593000,
  lastUpdatedText = "Hari Ini, Sesi 1",
}: LivePriceBoardProps) {
  const [selectedTab, setSelectedTab] = useState<"antam" | "retro" | "minigold" | "silver">("antam");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group products for the table tabs
  const antamProducts = products.filter(
    (p) => p.category === "gold" && p.type.toUpperCase() === "ANTAM" && !p.name.toLowerCase().includes("sale")
  );

  const retroProducts = products.filter(
    (p) => p.category === "gold" && p.type.toUpperCase().includes("RETRO")
  );

  const minigoldProducts = products.filter(
    (p) => p.category === "gold" && (p.type.toUpperCase().includes("MINIGOLD") || p.type.toUpperCase().includes("MICRO"))
  );

  const silverProducts = products.filter(
    (p) => p.category === "silver"
  );

  let currentTabProducts = antamProducts;
  if (selectedTab === "retro") currentTabProducts = retroProducts;
  if (selectedTab === "minigold") currentTabProducts = minigoldProducts;
  if (selectedTab === "silver") currentTabProducts = silverProducts;

  // If current tab is empty, fallback to whatever products exist
  if (currentTabProducts.length === 0 && products.length > 0) {
    currentTabProducts = products.slice(0, 10);
  }

  // 7-day trend sample points
  const trendPoints = [
    { day: "Kam", price: Math.round(baseBuyPerGram * 0.985) },
    { day: "Jum", price: Math.round(baseBuyPerGram * 0.988) },
    { day: "Sab", price: Math.round(baseBuyPerGram * 0.990) },
    { day: "Min", price: Math.round(baseBuyPerGram * 0.990) },
    { day: "Sen", price: Math.round(baseBuyPerGram * 0.994) },
    { day: "Sel", price: Math.round(baseBuyPerGram * 0.997) },
    { day: "Hari ini", price: baseBuyPerGram },
  ];

  const getWaLink = (product: StorefrontProduct) => {
    const text = encodeURIComponent(
      `Halo Rahafa Gold, saya ingin membeli ${product.name} (${formatRupiah(product.total_price)}). Mohon info ketersediaan stoknya.`
    );
    return `https://wa.me/6285384109496?text=${text}`;
  };

  return (
    <section id="harga-tren" className="py-16 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[#b47a00] text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Transparansi Nilai Aset Real-Time
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#1b355a]">
              Papan Harga Emas &amp; Perak Hari Ini
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Harga pasar acuan resmi terintegrasi langsung dengan database manajemen Rahafa Gold. Diperbarui setiap hari kerja dengan spread buyback terbaik.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pembaruan: <strong className="text-[#1b355a]">{lastUpdatedText}</strong></span>
          </div>
        </div>

        {/* Top Cards: Live Benchmark Rate & Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Live Benchmark Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1b355a] to-[#122540] rounded-2xl p-6 text-white shadow-lg border border-[#2c4b78] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#fed65b] bg-[#24426d] px-2.5 py-1 rounded border border-[#3b5d8d]">
                  Acuan Spot Emas 1 Gram
                </span>
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +1.51% (7 Hari)
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs font-medium text-slate-300">Harga Beli Retail (1 Gram)</div>
                  <div className="text-3xl font-black text-[#fed65b] mt-1 font-sans">
                    {formatRupiah(baseBuyPerGram)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Sesuai harga aktif di sistem dashboard Rahafa
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs font-medium text-slate-300">Garansi Harga Buyback (1 Gram)</div>
                  <div className="text-2xl font-black text-white mt-1 font-sans">
                    {formatRupiah(baseBuybackPerGram)}
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Pencairan Langsung / Transfer Hari yang Sama
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-slate-300">
              <span>Spread: <strong>{formatRupiah(baseBuyPerGram - baseBuybackPerGram)}</strong></span>
              <span className="text-[#fed65b] font-semibold">Kompetitif &amp; Terbuka</span>
            </div>
          </div>

          {/* 7-Day Trend Chart Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#d99b00]" />
                  <h3 className="font-bold text-slate-900 text-base">Grafik Tren 7 Hari Terakhir (IDR/Gram)</h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
                  <span className="px-2.5 py-1 rounded bg-white text-[#1b355a] shadow-sm">Spot Emas 24K</span>
                </div>
              </div>

              {/* Visual Trend SVG */}
              <div className="h-44 w-full relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#goldGradient)"
                    points="0,100 0,85 80,68 160,60 240,60 320,38 400,28 500,10 500,120 0,120"
                  />
                  <polyline
                    fill="none"
                    stroke="#d99b00"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,85 80,68 160,60 240,60 320,38 400,28 500,10"
                  />
                  <circle cx="0" cy="85" r="4" fill="#1b355a" stroke="#d99b00" strokeWidth="2" />
                  <circle cx="80" cy="68" r="4" fill="#1b355a" stroke="#d99b00" strokeWidth="2" />
                  <circle cx="160" cy="60" r="4" fill="#1b355a" stroke="#d99b00" strokeWidth="2" />
                  <circle cx="240" cy="60" r="4" fill="#1b355a" stroke="#d99b00" strokeWidth="2" />
                  <circle cx="320" cy="38" r="4" fill="#1b355a" stroke="#d99b00" strokeWidth="2" />
                  <circle cx="400" cy="28" r="4" fill="#1b355a" stroke="#d99b00" strokeWidth="2" />
                  <circle cx="500" cy="10" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                </svg>

                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  {trendPoints.map((p, idx) => (
                    <div key={idx} className="text-center">
                      <span>{p.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div>
                Terendah: <strong className="text-slate-800">{formatRupiah(trendPoints[0].price)}</strong>
              </div>
              <div>
                Tertinggi: <strong className="text-[#1b355a]">{formatRupiah(baseBuyPerGram)}</strong>
              </div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Tren Stabil Positif
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Table: Denomination Rates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#1b355a] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base tracking-wide font-serif">
                Tabel Harga Produk Rahafa Gold (Database Live)
              </h3>
              <p className="text-xs text-slate-300">
                Data harga harian resmi yang aktif di sistem kasir dan inventaris
              </p>
            </div>

            {/* Table Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-[#142640] p-1 rounded-xl">
              <button
                onClick={() => setSelectedTab("antam")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "antam" ? "bg-[#fed65b] text-[#1a1200]" : "text-slate-300 hover:text-white"
                }`}
              >
                Emas Antam ({antamProducts.length})
              </button>
              <button
                onClick={() => setSelectedTab("retro")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "retro" ? "bg-[#fed65b] text-[#1a1200]" : "text-slate-300 hover:text-white"
                }`}
              >
                Retro Antam ({retroProducts.length})
              </button>
              <button
                onClick={() => setSelectedTab("minigold")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "minigold" ? "bg-[#fed65b] text-[#1a1200]" : "text-slate-300 hover:text-white"
                }`}
              >
                Mini &amp; Micro ({minigoldProducts.length})
              </button>
              <button
                onClick={() => setSelectedTab("silver")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTab === "silver" ? "bg-[#fed65b] text-[#1a1200]" : "text-slate-300 hover:text-white"
                }`}
              >
                Perak &amp; Dirham ({silverProducts.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Produk &amp; Kode</th>
                  <th className="py-3.5 px-4 text-center">Gramatur</th>
                  <th className="py-3.5 px-4 text-right">Harga Retail</th>
                  <th className="py-3.5 px-4 text-right">Pajak PPh (0.25%)</th>
                  <th className="py-3.5 px-6 text-right font-black text-[#1b355a]">Total Beli</th>
                  <th className="py-3.5 px-6 text-right text-emerald-700">Estimasi Buyback</th>
                  <th className="py-3.5 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {currentTabProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-[#b47a00] flex items-center justify-center text-xs font-black">
                          {p.weight}g
                        </div>
                        <div>
                          <span>{p.name}</span>
                          <div className="text-[11px] font-mono font-normal text-slate-400">
                            Kode: {p.item_code} • {p.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                        {p.weight} {p.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-600">
                      {formatRupiah(p.retail_price)}
                    </td>
                    <td className="py-4 px-4 text-right text-xs text-slate-500">
                      {formatRupiah(p.tax)}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-base text-[#1b355a]">
                      {formatRupiah(p.total_price)}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-700">
                      {formatRupiah(p.buyback_price)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/katalog/${p.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                        >
                          Detail
                        </Link>
                        <a
                          href={getWaLink(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#d99b00] hover:bg-[#c68a00] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Pesan</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
