"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Building2, TrendingUp, Wallet } from "lucide-react";

// Tipe Data
export type PlatformStats = {
  totalKoperasi: number;
  totalAnggota: number;
  totalTransaksi: number;
  totalDana: number;
};

// Hook kustom untuk animasi angka
const useCountUp = (end: number, duration: number = 2000, startAnimation: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    let startTime: number | null = null;
    const start = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutExpo) agar gerakan angka halus di akhir
      const easeOut = 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(start + (end - start) * easeOut));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration, startAnimation]);

  return count;
};

// Komponen Format Angka
const AnimatedNumber = ({ value, isCurrency = false, start }: { value: number, isCurrency?: boolean, start: boolean }) => {
  const count = useCountUp(value, 2000, start);

  if (isCurrency) {
    // Format Rupiah Singkat (Misal: 2.5 M, 500 Jt) atau Penuh
    // Kita pakai format penuh tapi ringkas
    return (
      <span>
        Rp {new Intl.NumberFormat("id-ID").format(count)}
      </span>
    );
  }

  return <span>{new Intl.NumberFormat("id-ID").format(count)}+</span>;
};

export default function StatsSection({ stats, isLoading }: { stats: PlatformStats | null, isLoading: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Deteksi ketika section masuk layar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observe setelah muncul sekali
        }
      },
      { threshold: 0.3 } // Muncul ketika 30% section terlihat
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Data default jika null (untuk skeleton structure)
  const data = stats || { totalKoperasi: 0, totalAnggota: 0, totalTransaksi: 0, totalDana: 0 };

  // Helper untuk Skeleton
  const SkeletonItem = () => (
      <div className="flex flex-col items-center gap-4 animate-pulse">
         <div className="w-16 h-16 rounded-full bg-white/20" />
         <div className="h-8 w-32 bg-white/20 rounded" />
         <div className="h-4 w-24 bg-white/20 rounded" />
      </div>
  );

  return (
    <section 
        ref={sectionRef} 
        className="py-20 bg-brand-red-600 text-white relative overflow-hidden"
    >
      {/* Dekorasi Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          
          {/* ITEM 1: Total Koperasi */}
          {isLoading ? <SkeletonItem /> : (
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold mb-2">
                <AnimatedNumber value={data.totalKoperasi} start={isVisible} />
              </div>
              <p className="text-red-100 font-medium text-sm md:text-base">Koperasi Bergabung</p>
            </div>
          )}

          {/* ITEM 2: Total Anggota */}
          {isLoading ? <SkeletonItem /> : (
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold mb-2">
                <AnimatedNumber value={data.totalAnggota} start={isVisible} />
              </div>
              <p className="text-red-100 font-medium text-sm md:text-base">Anggota Aktif</p>
            </div>
          )}

          {/* ITEM 3: Transaksi */}
          {isLoading ? <SkeletonItem /> : (
             <div className="flex flex-col items-center group">
             <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
               <TrendingUp className="w-8 h-8 text-white" />
             </div>
             <div className="text-3xl md:text-4xl font-extrabold mb-2">
               <AnimatedNumber value={data.totalTransaksi} start={isVisible} />
             </div>
             <p className="text-red-100 font-medium text-sm md:text-base">Transaksi Terproses</p>
           </div>
          )}

          {/* ITEM 4: Total Dana */}
          {isLoading ? <SkeletonItem /> : (
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold mb-2">
                <AnimatedNumber value={data.totalDana} isCurrency start={isVisible} />
              </div>
              <p className="text-red-100 font-medium text-sm md:text-base">Dana Dikelola</p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}