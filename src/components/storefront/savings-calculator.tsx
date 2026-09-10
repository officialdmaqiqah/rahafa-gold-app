"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  Sparkles,
  MessageCircle
} from "lucide-react";

export function SavingsCalculator({
  baseGoldPerGram = 1345000,
}: {
  baseGoldPerGram?: number;
}) {
  const [monthlyAmount, setMonthlyAmount] = useState<number>(2500000);
  const annualGrowthRate = 0.12; // 12% rata-rata apresiasi emas per tahun

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations
  const calcProjection = (years: number) => {
    const totalMonths = years * 12;
    const totalInvested = monthlyAmount * totalMonths;
    // Total emas terkumpul jika dibeli dengan harga rata-rata
    const totalGrams = totalInvested / baseGoldPerGram;
    // Estimasi nilai masa depan dengan compounding tahunan
    const estimatedValue = totalInvested * Math.pow(1 + annualGrowthRate / 2, years);
    const estimatedProfit = estimatedValue - totalInvested;

    return {
      years,
      totalInvested,
      totalGrams: totalGrams.toFixed(2),
      estimatedValue,
      estimatedProfit,
    };
  };

  const proj1 = calcProjection(1);
  const proj3 = calcProjection(3);
  const proj5 = calcProjection(5);

  const presets = [1000000, 2500000, 5000000, 10000000];

  const getWaLink = () => {
    const text = encodeURIComponent(
      `Halo Rahafa Gold, saya ingin memulai program tabungan/akumulasi emas rutin sebesar ${formatRupiah(monthlyAmount)} per bulan. Bagaimana langkah pendaftaran dan penyimpanannya?`
    );
    return `https://wa.me/6285384109496?text=${text}`;
  };

  return (
    <section id="kalkulator" className="py-16 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[#b47a00] text-xs font-bold uppercase tracking-wider mb-2">
                  <Calculator className="w-3.5 h-3.5" />
                  Simulasi Akumulasi Emas Fisik
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#1b355a]">
                  Kalkulator Tabungan &amp; Proyeksi Nilai
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Hitung seberapa cepat aset emas Anda bertumbuh dengan menabung secara disiplin setiap bulan. Bebas risiko inflasi nilai tukar mata uang.
                </p>
              </div>

              {/* Slider Controller */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Target Alokasi Bulanan
                  </span>
                  <span className="text-xl font-black text-[#1b355a] font-sans">
                    {formatRupiah(monthlyAmount)}
                  </span>
                </div>

                <input
                  type="range"
                  min={500000}
                  max={20000000}
                  step={500000}
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d99b00]"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Preset:</span>
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setMonthlyAmount(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        monthlyAmount === p
                          ? "bg-[#1b355a] text-white border-[#1b355a] shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {formatRupiah(p).replace(",00", "")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1.5">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Emas fisik dapat dicetak kapan saja dalam denominasi 1g hingga 100g.
                </p>
                <p className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Penyimpanan brankas aman atau kirim langsung ke alamat rumah Anda.
                </p>
              </div>
            </div>

            {/* Right Projection Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1 Year Projection */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Proyeksi 1 Tahun
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {formatRupiah(proj1.estimatedValue)}
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{formatRupiah(proj1.estimatedProfit)} (Est. Apresiasi)
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200 text-xs text-slate-500">
                    Estimasi Emas Terkumpul: <strong className="text-slate-900">{proj1.totalGrams} Gram</strong>
                  </div>
                </div>

                {/* 3 Years Projection */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Proyeksi 3 Tahun
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {formatRupiah(proj3.estimatedValue)}
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{formatRupiah(proj3.estimatedProfit)} (Est. Apresiasi)
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200 text-xs text-slate-500">
                    Estimasi Emas Terkumpul: <strong className="text-slate-900">{proj3.totalGrams} Gram</strong>
                  </div>
                </div>
              </div>

              {/* 5 Years Highlight Card (Navy & Warm Gold) */}
              <div className="bg-gradient-to-br from-[#1b355a] to-[#122540] rounded-2xl p-6 text-white border border-[#2d4d7a] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#fed65b]">
                      Proyeksi Jangka Panjang (5 Tahun)
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {formatRupiah(proj5.estimatedValue)}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Total Modal: {formatRupiah(proj5.totalInvested)} • Potensi Apresiasi:{" "}
                    <strong className="text-[#fed65b]">+{formatRupiah(proj5.estimatedProfit)}</strong>
                  </p>
                  <p className="text-xs text-amber-200/80 mt-1">
                    Akumulasi Logam Mulia: <strong>{proj5.totalGrams} Gram Emas Murni 24K</strong>
                  </p>
                </div>

                <a
                  href={getWaLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d99b00] to-[#f2ca50] hover:from-[#c68a00] hover:to-[#e2b83a] text-[#1a1200] font-bold text-xs shadow-md transition-all duration-200 whitespace-nowrap flex items-center gap-2 flex-shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Mulai Program Tabungan</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
