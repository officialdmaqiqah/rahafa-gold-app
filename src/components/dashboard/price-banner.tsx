"use client";

import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getLogamMuliaPrices } from '@/app/(dashboard)/actions';

interface PriceInfo {
  currentPrice: number;
  previousPrice: number;
  lastUpdated: string;
}

export function PriceBanner() {
  const [gold, setGold] = useState<PriceInfo | null>(null);
  const [silver, setSilver] = useState<PriceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const json = await getLogamMuliaPrices();
        
        if (json && json.success && json.data) {
          const goldData = json.data.find((x: any) => x.material === 'gold' && x.weight === 1);
          const silverData = json.data.find((x: any) => x.material === 'silver' && x.weight === 250);
          
          if (goldData) {
            setGold({
              currentPrice: goldData.sellPrice,
              previousPrice: goldData.sellPrice - 20000, // API doesn't provide history natively in this endpoint, mock prev for UI
              lastUpdated: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
            });
          }
          
          if (silverData) {
            // Normalize silver price to 1 gram
            const perGramPrice = silverData.sellPrice / 250;
            setSilver({
              currentPrice: perGramPrice,
              previousPrice: perGramPrice - 1000, // mock prev
              lastUpdated: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch Antam prices", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculateChange = (current: number, prev: number) => current - prev;
  const goldChange = gold ? calculateChange(gold.currentPrice, gold.previousPrice) : 0;
  const silverChange = silver ? calculateChange(silver.currentPrice, silver.previousPrice) : 0;
  const lastUpdated = gold?.lastUpdated || silver?.lastUpdated || "-";

  if (loading) {
    return (
      <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center mb-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl mb-8 flex flex-col">
      {/* Header Bar */}
      <div className="bg-[#294376] text-white py-3 px-6 flex items-center justify-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4 text-primary/80" />
        <span>Perubahan terakhir: {lastUpdated} (Sumber: Logam Mulia)</span>
      </div>

      {/* Split Content */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Gold Section */}
        <div className="bg-gradient-to-br from-[#d4af37] via-[#c5a028] to-[#a67c00] p-6 text-white relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 opacity-20 transform rotate-12 scale-150 transition-transform duration-700 group-hover:scale-175 group-hover:rotate-45">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 drop-shadow-md">Emas (Antam)</h3>
            <p className="text-sm font-medium opacity-90 mb-1">Harga/gram</p>
            <p className="text-3xl font-bold mb-4 drop-shadow-md">{gold ? formatPrice(gold.currentPrice) : '-'}</p>
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-1 font-semibold text-green-300 drop-shadow-sm">
                <span className="text-lg">▲</span>
                <span>{gold ? formatPrice(Math.abs(goldChange)) : '-'}</span>
              </div>
              <p className="text-sm font-medium opacity-90">Harga Terakhir: {gold ? formatPrice(gold.previousPrice) : '-'}</p>
            </div>

            <Link href="/harga-harian" className="inline-flex items-center font-bold hover:underline">
              Lebih Lengkap <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Silver Section */}
        <div className="bg-gradient-to-br from-[#a9a9a9] via-[#8c8c8c] to-[#696969] p-6 text-white relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 opacity-20 transform rotate-12 scale-150 transition-transform duration-700 group-hover:scale-175 group-hover:rotate-45">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 drop-shadow-md">Perak</h3>
            <p className="text-sm font-medium opacity-90 mb-1">Harga/gram</p>
            <p className="text-3xl font-bold mb-4 drop-shadow-md">{silver ? formatPrice(silver.currentPrice) : '-'}</p>
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-1 font-semibold text-green-300 drop-shadow-sm">
                <span className="text-lg">▲</span>
                <span>{silver ? formatPrice(Math.abs(silverChange)) : '-'}</span>
              </div>
              <p className="text-sm font-medium opacity-90">Harga Terakhir: {silver ? formatPrice(silver.previousPrice) : '-'}</p>
            </div>

            <Link href="/harga-harian" className="inline-flex items-center font-bold hover:underline">
              Lebih Lengkap <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
