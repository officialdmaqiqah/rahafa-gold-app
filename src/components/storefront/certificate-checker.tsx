"use client";

import React from "react";
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Smartphone, 
  ScanLine, 
  ExternalLink,
  Sparkles,
  Award,
  Eye,
  Lock
} from "lucide-react";

export function CertificateChecker() {
  const steps = [
    {
      number: "01",
      title: "Unduh Aplikasi CertiEye",
      desc: "Instal aplikasi resmi CertiEye di smartphone Anda melalui Google Play Store (Android) atau Apple App Store (iOS).",
    },
    {
      number: "02",
      title: "Pindai Kode di Belakang Kemasan",
      desc: "Buka aplikasi CertiEye, lalu arahkan kamera ke barcode/kode khusus CertiEye yang terletak di sisi belakang kartu kemasan ANTAM.",
    },
    {
      number: "03",
      title: "Posisikan dalam Kotak Bidik",
      desc: "Posisikan kartu secara datar dengan pencahayaan cukup hingga aplikasi berhasil membaca mikropattern pengaman.",
    },
    {
      number: "04",
      title: "Konfirmasi Keaslian 'AUTHENTIC'",
      desc: "Jika kemasan asli dan belum pernah rusak/dipalsukan, aplikasi seketika menampilkan logo resmi PT ANTAM Tbk berstatus PASSED / AUTHENTIC.",
    },
  ];

  const physicalChecks = [
    {
      icon: Lock,
      title: "Segel Tamper-Evident Utuh",
      desc: "Kemasan CertiCard memiliki pengaman canggih anti buka-ulang. Jika pernah dicoba dibuka atau disayat, akan timbul pola robekan permanen yang tidak bisa dilem kembali.",
    },
    {
      icon: Sparkles,
      title: "Hologram Berpendar Dinamis",
      desc: "Logo ANTAM dan elemen hologram di kemasan memantulkan kilau warna pelangi spektral saat dilihat dari berbagai sudut kemiringan cahaya.",
    },
    {
      icon: Eye,
      title: "Pendaran Khusus Sinar UV",
      desc: "Di bawah pancaran lampu sinar ultraviolet (UV), kartu CertiCard asli memancarkan logo khusus dan serat fluorescent pengaman yang tidak bisa ditiru percetakan biasa.",
    },
  ];

  return (
    <section id="cek-sertifikat" className="py-12 sm:py-16 max-w-[1360px] mx-auto px-3.5 sm:px-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 lg:p-12 border border-slate-200 shadow-md">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[#b47a00] text-xs font-bold uppercase tracking-wider mb-3.5">
            <QrCode className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Panduan Resmi Verifikasi Keaslian</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#1b355a] text-balance leading-snug sm:leading-tight">
            Cara Cek Keaslian Emas ANTAM CertiCard
          </h2>

          <p className="mt-3 text-xs sm:text-base text-slate-600 leading-relaxed text-balance">
            Seluruh produk emas batangan ANTAM Logam Mulia yang tersedia di <strong>Rahafa Gold</strong> merupakan cetakan resmi PT ANTAM Tbk bersegel kemasan <em>CertiCard tamper-evident</em>. Untuk keamanan maksimal, ikuti panduan verifikasi resmi berikut menggunakan aplikasi <strong>CertiEye</strong> dan pemeriksaan fisik kemasan.
          </p>
        </div>

        {/* 2-Column Guide Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Digital Verification via CertiEye */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-[#1b355a] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Verifikasi Digital via Aplikasi CertiEye
                    </h3>
                    <p className="text-xs text-slate-300">
                      Standar resmi verifikasi PT ANTAM Tbk &amp; CertiCard Security
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validasi Akurat
                </span>
              </div>

              {/* 4 Step Process */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps.map((step) => (
                  <div 
                    key={step.number} 
                    className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
                        {step.number}
                      </span>
                      <h4 className="text-xs font-bold text-white">{step.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* App Download Links */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <ScanLine className="w-4 h-4 text-amber-300" />
                  Unduh aplikasi resmi CertiEye gratis:
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.certieye.mobile.certieyeb2c"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                  >
                    <span>Google Play</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://apps.apple.com/id/app/certieye/id977508930"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                  >
                    <span>App Store</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Physical Checks & Buyback Guarantee */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-[#b47a00]" />
                <h3 className="font-bold text-sm sm:text-base text-[#1b355a]">
                  3 Ciri Fisik Kemasan CertiCard Asli
                </h3>
              </div>

              <div className="space-y-3.5">
                {physicalChecks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b47a00] flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rahafa Gold Assurance Box */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
              <Award className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <strong className="block font-bold text-emerald-900">
                  Garansi Keaslian &amp; Buyback Rahafa Gold
                </strong>
                <p className="leading-relaxed text-emerald-800">
                  Setiap keping emas yang Anda beli di Rahafa Gold dijamin 100% cetakan asli resmi bersertifikat. Kami memberikan jaminan <em>buyback</em> langsung di butik kami dengan proses mudah dan pembayaran instan.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
