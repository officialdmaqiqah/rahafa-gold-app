"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Sparkles, 
  Search, 
  MessageCircle, 
  Lock, 
  Menu, 
  X, 
  ArrowUpRight,
  User,
  ExternalLink
} from "lucide-react";

interface StorefrontHeaderProps {
  buyPrice?: number;
  buybackPrice?: number;
  lastUpdated?: string;
}

export function StorefrontHeader({
  buyPrice = 1345000,
  buybackPrice = 1238000,
  lastUpdated = "15 Menit Lalu",
}: StorefrontHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const whatsappMessage = encodeURIComponent(
    "Halo Admin Rahafa Gold, saya tertarik konsultasi investasi emas batangan & perhiasan."
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-300">
      {/* 1. Top Price Ticker (Midnight Navy bar inspired by Stitch design) */}
      <div className="bg-[#1b355a] py-2 px-4 sm:px-8 text-white">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="bg-[#24426d] px-2.5 py-0.5 rounded text-[#fed65b] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] border border-[#3b5d8d]/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              HARGA HARI INI
            </span>
            <span className="font-medium text-slate-200">
              Beli:{" "}
              <strong className="text-[#fed65b] font-bold">
                {formatRupiah(buyPrice)}/gr
              </strong>{" "}
              <span className="text-emerald-300 text-[11px] font-semibold">
                (+0.8%)
              </span>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="font-medium text-slate-200">
              Buyback:{" "}
              <strong className="text-[#fed65b] font-bold">
                {formatRupiah(buybackPrice)}/gr
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-[11px]">
            <span>Update: {lastUpdated}</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              LBMA & SNI 8887 Certified
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="h-20 max-w-[1360px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f2ca50] to-[#b38f26] p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#1b355a] rounded-[10px] flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 text-[#fed65b]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-[#1b355a] tracking-tight font-serif flex items-center gap-1">
              RAHAFA GOLD
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-0.5">
              Investasi & Perhiasan Mulia
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 flex-shrink-0 text-sm font-medium">
          <Link
            href="/"
            className="text-[#d99b00] font-bold transition-colors hover:text-[#b38f26]"
          >
            Beranda
          </Link>
          <a
            href="#katalog"
            className="text-slate-600 hover:text-[#1b355a] transition-colors"
          >
            Katalog Emas
          </a>
          <a
            href="#harga-tren"
            className="text-slate-600 hover:text-[#1b355a] transition-colors"
          >
            Papan Harga
          </a>
          <a
            href="#cek-sertifikat"
            className="text-slate-600 hover:text-[#1b355a] transition-colors"
          >
            Cek Sertifikat
          </a>
          <a
            href="#kalkulator"
            className="text-slate-600 hover:text-[#1b355a] transition-colors"
          >
            Kalkulator Tabungan
          </a>
          <a
            href="#tentang-kami"
            className="text-slate-600 hover:text-[#1b355a] transition-colors"
          >
            Tentang Kami
          </a>
          <a
            href="#kontak"
            className="text-slate-600 hover:text-[#1b355a] transition-colors"
          >
            Butik & Kontak
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* WA Konsultasi */}
          <a
            href={`https://wa.me/6285384109496?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-2 rounded-lg transition-all text-xs font-bold tracking-wide"
          >
            <MessageCircle className="w-4 h-4 text-[#d99b00]" />
            <span>Konsultasi Emas</span>
          </a>

          {/* Tombol Masuk / Dashboard */}
          <Link
            href="/dashboard"
            className="bg-[#1b355a] hover:bg-[#152a47] text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Masuk / Dashboard</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#d99b00] font-bold py-1"
            >
              Beranda
            </Link>
            <a
              href="#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1b355a] py-1"
            >
              Katalog Emas
            </a>
            <a
              href="#harga-tren"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1b355a] py-1"
            >
              Papan Harga & Tren
            </a>
            <a
              href="#cek-sertifikat"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1b355a] py-1"
            >
              Cek Sertifikat & Keaslian
            </a>
            <a
              href="#kalkulator"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1b355a] py-1"
            >
              Kalkulator Tabungan
            </a>
            <a
              href="#tentang-kami"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1b355a] py-1"
            >
              Tentang Kami
            </a>
            <a
              href="#kontak"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1b355a] py-1"
            >
              Butik Resmi & Kontak
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/6285384109496?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2 px-4 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#d99b00]" />
              Hubungi WhatsApp Resmi
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 px-4 rounded-lg bg-[#1b355a] text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              Masuk Dashboard Kasir / Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
