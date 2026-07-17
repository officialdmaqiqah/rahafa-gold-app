"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock } from 'lucide-react';

export function GreetingBanner({ role }: { role: string }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    if (!time) return 'Selamat Datang';
    const hour = time.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const formattedDate = time 
    ? time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Memuat...';
    
  const formattedTime = time
    ? time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <>
      <style>{`
        @keyframes shine {
          0% { left: -100%; opacity: 0; }
          20% { opacity: 0.5; }
          100% { left: 200%; opacity: 0; }
        }
        .animate-shine {
          animation: shine 4s ease-in-out infinite;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(12deg) scale(1.5); }
          50% { transform: translateY(-20px) rotate(15deg) scale(1.6); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl mb-8 flex flex-col min-h-[160px] bg-gradient-to-br from-[#294376] via-[#1a2d54] to-[#0f1b33]">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          {/* Shimmer sweep effect */}
          <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-shine" />
          
          {/* Floating Abstract Shapes */}
          <div className="absolute -right-10 -top-10 opacity-10 text-[#d4af37] animate-float-slow">
            <svg width="250" height="250" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L22 7L12 12L2 7L12 2Z" />
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          
          <div className="absolute top-[30%] left-[20%] w-48 h-48 bg-primary/20 rounded-full blur-[60px] animate-pulse duration-1000" />
          <div className="absolute bottom-[-20%] right-[10%] w-64 h-64 bg-[#d4af37]/20 rounded-full blur-[80px] animate-pulse duration-700 delay-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:px-10 h-full">
          <div className="flex flex-col gap-2 text-white items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 mb-1">
              <Sparkles className="text-[#d4af37] w-4 h-4 animate-pulse" />
              <span className="text-[#d4af37] font-semibold tracking-wider uppercase text-[11px] drop-shadow-sm">Rahafa Gold System</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 drop-shadow-sm">
              {getGreeting()}, {role === 'kasir' ? 'Kasir' : 'Admin'}!
            </h2>
            <p className="text-slate-300/90 font-medium text-sm md:text-base mt-1">
              {role === 'kasir' 
                ? 'Siap untuk melayani pelanggan hari ini?' 
                : 'Pantau terus perkembangan bisnis Anda hari ini.'}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-white mt-6 md:mt-0">
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span className="font-medium text-sm text-white/90">
                {formattedDate}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3 px-2">
              <Clock className="w-5 h-5 text-primary/70 animate-pulse hidden md:block" />
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 font-mono tabular-nums drop-shadow-md">
                {formattedTime}
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Bottom Line */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-[#d4af37] to-primary w-full opacity-80" />
      </div>
    </>
  );
}
