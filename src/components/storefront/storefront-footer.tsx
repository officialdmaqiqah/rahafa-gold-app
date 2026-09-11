import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Lock, ExternalLink } from "lucide-react";

export function StorefrontFooter() {
  return (
    <footer className="bg-[#0f1b2e] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f2ca50] to-[#b38f26] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#1b355a] rounded-[10px] flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4 text-[#fed65b]" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl text-white font-serif tracking-tight">
                  RAHAFA GOLD
                </span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Investasi &amp; Perhiasan Mulia
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Butik dan pusat jual beli resmi logam mulia emas batangan ANTAM LM CertiCard, Retro Antam, MiniGold, koin dirham syariah, dan perak murni. Menghadirkan transaksi aman dengan jaminan keaslian seumur hidup dan buyback likuid terpercaya.
            </p>

            <div className="flex items-center gap-3 text-xs text-amber-300/90 pt-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sertifikasi Standar SNI 8887:2020</span>
            </div>
          </div>

          {/* Col 2: Navigasi (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <a href="#katalog" className="hover:text-amber-300 transition-colors">
                  Katalog Logam Mulia
                </a>
              </li>
              <li>
                <a href="#harga-tren" className="hover:text-amber-300 transition-colors">
                  Papan Harga Hari Ini
                </a>
              </li>
              <li>
                <a href="#cek-sertifikat" className="hover:text-amber-300 transition-colors">
                  Cek Keaslian Sertifikat
                </a>
              </li>
              <li>
                <a href="#kalkulator" className="hover:text-amber-300 transition-colors">
                  Kalkulator Tabungan
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Layanan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#katalog" className="hover:text-amber-300 transition-colors">
                  Emas Batangan Minted
                </a>
              </li>
              <li>
                <a href="#katalog" className="hover:text-amber-300 transition-colors">
                  Koin Dinar Syariah
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-amber-300 transition-colors">
                  Layanan Buyback Cepat
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-amber-300 transition-colors">
                  Titip Brankas Aman
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Portal Kasir &amp; Admin</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Kontak (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Alamat &amp; Kontak</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <strong className="text-slate-200 block">Butik Rahafa Gold:</strong>
              <p className="leading-relaxed">
                Jl. Flamingo Gandaria 1 Kel. Air Kepala Tujuh Kec. Gerunggang Kota Pangkalpinang
              </p>
              <a
                href="https://maps.app.goo.gl/mgQBGAFfSrzVm2Gq9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 text-[11px] font-medium pt-0.5 hover:underline"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="pt-1">
              <span className="text-xs text-slate-400 block">Layanan Konsultasi &amp; Order:</span>
              <a
                href="https://wa.me/6285384109496"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-amber-300 hover:underline"
              >
                +62 853-8410-9496
              </a>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Senin – Sabtu: 09:00 – 17:00 WIB
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Rahafa Gold &amp; Silver. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Syarat &amp; Ketentuan</span>
            <span>Kebijakan Privasi</span>
            <span>Kebijakan Buyback</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
