"use client";

import { useEffect, useState } from "react";

export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; size: string; animationDuration: string; animationDelay: string }>>([]);

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const newParticles = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`, // 2px to 6px
      animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s
      animationDelay: `-${Math.random() * 25}s`, // Start at different times to stagger
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#0a1128_100%)] opacity-40 z-10"></div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-400/80 shadow-[0_0_10px_2px_rgba(245,158,11,0.6)]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            bottom: "-5%",
            animation: `float-up ${p.animationDuration} ease-in infinite`,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
