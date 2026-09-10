import React from "react";
import { ShieldCheck, RefreshCw, Lock, Truck } from "lucide-react";

export function TrustBar() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Kemurnian 99.99% Teruji",
      desc: "Standar SNI 8887 dan akreditasi LBMA dengan sertifikat resmi assay lab.",
    },
    {
      icon: RefreshCw,
      title: "Garansi Buyback Tertinggi",
      desc: "Jaminan likuiditas tunai instan dengan spread harga pasar yang transparan.",
    },
    {
      icon: Lock,
      title: "Segel CertiCard Gen-3",
      desc: "Kemasan anti-pemalsuan tamper-evident berhologram dengan QR code terenkripsi.",
    },
    {
      icon: Truck,
      title: "Pengiriman Berasuransi Penuh",
      desc: "Ekspedisi khusus bernilai tinggi dengan proteksi asuransi hingga 100%.",
    },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all duration-300 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-[#b47a00]">
              <h.icon className="w-6 h-6 text-[#d99b00]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{h.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
