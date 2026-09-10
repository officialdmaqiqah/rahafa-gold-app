import React from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Award, 
  CheckCircle2, 
  MessageCircle,
  Building2
} from "lucide-react";

export function BoutiqueAndReviews() {
  const reviews = [
    {
      name: "H. Bambang S.",
      role: "Investor Logam Mulia (Denpasar)",
      comment: "Transparansi harga Rahafa Gold sangat luar biasa. Spread buyback sangat bersahabat dan sertifikat CertiCard-nya bisa saya scan langsung di depan kasir. Pencairan buyback tidak berbelit-belit.",
      rating: 5,
      date: "Agustus 2026",
    },
    {
      name: "Ibu Ratna Dewi",
      role: "Kolektor Perhiasan & Dinar (Surabaya)",
      comment: "Desain koin Dinar Syariah dan perhiasan batangan 24K nya sangat rapi dan presisi. Pengiriman menggunakan proteksi asuransi penuh sampai ke rumah dengan kurir brankas terpercaya.",
      rating: 5,
      date: "September 2026",
    },
    {
      name: "dr. Hendra Pratama",
      role: "Program Tabungan Emas Rutin (Jakarta)",
      comment: "Sangat terbantu dengan layanan konsultasi private vault. Setiap gram emas yang saya tabung jelas tercatat nomor serinya di sistem database. Sangat direkomendasikan.",
      rating: 5,
      date: "September 2026",
    },
  ];

  return (
    <section id="kontak" className="py-12 sm:py-16 max-w-[1360px] mx-auto px-3.5 sm:px-8">
      {/* 1. Mengapa Memilih Rahafa Gold */}
      <div id="tentang-kami" className="mb-12 sm:mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[#b47a00] text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            Integritas &amp; Kepercayaan
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#1b355a] text-balance">
            Mengapa Memilih Rahafa Gold?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2 text-balance">
            Dedikasi kami untuk menghadirkan emas murni dengan transparansi total, keamanan kelas perbankan, dan kenyamanan transaksi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1b355a] text-amber-300 flex items-center justify-center font-bold text-xs sm:text-sm mb-3 sm:mb-4">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">Standar Purity SNI 8887</h4>
            <p className="text-xs text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
              Jaminan kemurnian emas fisik 99.99% (24 Karat) dengan uji assay akreditasi laboratorium standar nasional dan internasional.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1b355a] text-amber-300 flex items-center justify-center font-bold text-xs sm:text-sm mb-3 sm:mb-4">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">Garansi Buyback Resmi</h4>
            <p className="text-xs text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
              Komitmen membeli kembali emas batangan ANTAM dan logam mulia resmi dengan patokan harga pasar terupdate tanpa potongan tersembunyi.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1b355a] text-amber-300 flex items-center justify-center font-bold text-xs sm:text-sm mb-3 sm:mb-4">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">Segel Anti-Pemalsuan</h4>
            <p className="text-xs text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
              Teknologi kemasan CertiCard tamper-evident dengan kode QR unik terenkripsi untuk verifikasi instan di mana saja.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1b355a] text-amber-300 flex items-center justify-center font-bold text-xs sm:text-sm mb-3 sm:mb-4">
              04
            </div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">Konsultasi Portofolio</h4>
            <p className="text-xs text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
              Layanan tim wealth concierge untuk membantu keluarga, bisnis, dan institusi merencanakan tabungan aset emas batangan.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Testimonials Grid */}
      <div className="mb-12 sm:mb-16">
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#1b355a] text-center mb-6 sm:mb-8 text-balance">
          Kepercayaan Investor &amp; Pelanggan Rahafa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2.5 sm:mb-3">
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">{r.name}</strong>
                  <span className="text-slate-500 text-[11px]">{r.role}</span>
                </div>
                <span className="text-[10px] text-slate-400">{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Boutique Location & Contact Box */}
      <div className="bg-gradient-to-br from-[#1b355a] to-[#122540] rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl border border-[#274673]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="bg-[#24426d] px-3 py-1 rounded-full text-[#fed65b] font-bold text-xs uppercase tracking-wider border border-[#3b5d8d] inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Butik Resmi &amp; Vault Showroom
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Kunjungi Butik Resmi Rahafa Gold
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              Nikmati kenyamanan transaksi emas langsung di butik kami dengan ruang konsultasi privat, mesin uji kemurnian assay di tempat, serta penyerahan pesanan yang aman dan tertutup.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Butik Pusat Rahafa Gold</strong>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Jl. Jendral Sudirman Kav. 52-53, Kawasan Bisnis Terpadu, Jakarta Selatan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>Senin – Sabtu: 09:00 – 17:00 WIB (Minggu &amp; Hari Libur Tutup)</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>Layanan Pelanggan WhatsApp: +62 853-8410-9496</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <MessageCircle className="w-8 h-8 text-[#fed65b]" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Jadwalkan Konsultasi Tatap Muka</h4>
              <p className="text-xs text-slate-300 mt-1">
                Ingin bertransaksi jumlah besar atau konsultasi program buyback korporasi? Hubungi concierge kami sekarang.
              </p>
            </div>
            <a
              href="https://wa.me/6285384109496?text=Halo%20Rahafa%20Gold,%20saya%20ingin%20menjadwalkan%20kunjungan%20ke%20butik%20resmi."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d99b00] to-[#f2ca50] hover:from-[#c68a00] hover:to-[#e2b83a] text-[#1a1200] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
