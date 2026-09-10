"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  Gem, 
  Layers, 
  MessageCircle 
} from "lucide-react";
import { StorefrontProduct } from "@/lib/storefront-data";

interface ProductCatalogProps {
  products?: StorefrontProduct[];
}

export function ProductCatalog({ products = [] }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("semua");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory === "semua") return true;
    if (activeCategory === "antam") return p.category === "gold" && p.type.toUpperCase() === "ANTAM";
    if (activeCategory === "retro") return p.category === "gold" && p.type.toUpperCase().includes("RETRO");
    if (activeCategory === "minigold") return p.category === "gold" && (p.type.toUpperCase().includes("MINIGOLD") || p.type.toUpperCase().includes("MICRO"));
    if (activeCategory === "dirham") return p.type.toUpperCase().includes("DIRHAM") || p.type.toUpperCase().includes("RUPIYA");
    if (activeCategory === "silverium") return p.type.toUpperCase().includes("SILVERIUM");
    return true;
  });

  const getWaLink = (product: StorefrontProduct) => {
    const text = encodeURIComponent(
      `Halo Rahafa Gold, saya tertarik memesan produk:\n• ${product.name} (${product.weight}${product.unit})\n• Kode: ${product.item_code}\n• Harga Hari Ini: ${formatRupiah(product.total_price)}\n\nApakah stok masih tersedia?`
    );
    return `https://wa.me/6285384109496?text=${text}`;
  };

  return (
    <section id="katalog" className="py-16 max-w-[1360px] mx-auto px-4 sm:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[#b47a00] text-xs font-bold uppercase tracking-wider mb-2">
            <Gem className="w-3.5 h-3.5" />
            Katalog Produk Resmi
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#1b355a]">
            Koleksi Logam Mulia Emas &amp; Perak Rahafa
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Menampilkan seluruh produk aktif dari sistem manajemen Rahafa Gold dengan update harga harian resmi secara langsung.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          Total {filteredProducts.length} Produk Tersedia
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {[
          { id: "semua", label: "Semua Produk", icon: Layers },
          { id: "antam", label: "Emas Antam CertiCard", icon: Sparkles },
          { id: "retro", label: "Retro Antam", icon: ShieldCheck },
          { id: "minigold", label: "MiniGold & Micro", icon: Gem },
          { id: "dirham", label: "Koin Dirham & Rupiya", icon: Coins },
          { id: "silverium", label: "Perak Silverium", icon: Layers },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-[#1b355a] text-white border-[#1b355a] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Visual Box */}
            <div className="relative h-60 bg-gradient-to-b from-slate-900 via-[#101935] to-slate-950 p-6 flex items-center justify-center overflow-hidden">
              {p.tag && (
                <span className="absolute top-4 left-4 bg-amber-400/90 backdrop-blur-sm text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  {p.tag}
                </span>
              )}
              <span className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-0.5 rounded border border-white/10">
                {p.badge}
              </span>

              {/* Real Product Image Frame */}
              <div className="relative h-48 w-full flex items-center justify-center p-2">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-auto max-w-full object-contain rounded-lg transform group-hover:scale-105 transition-transform duration-500 shadow-xl"
                  loading="lazy"
                />
              </div>

              <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>SNI &amp; LBMA Certified</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{p.type}</span>
                  <span className="font-mono">Kode: {p.item_code}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1 group-hover:text-[#b47a00] transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gramatur: {p.weight} {p.unit} • Segel Asli Terverifikasi
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Harga Hari Ini
                  </div>
                  <div className="text-xl font-black text-[#1b355a]">
                    {formatRupiah(p.total_price)}
                  </div>
                  {p.buyback_price > 0 && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      Buyback: {formatRupiah(p.buyback_price)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/katalog/${p.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    Detail
                  </Link>
                  <a
                    href={getWaLink(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#d99b00] hover:bg-[#c68a00] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Pesan</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
