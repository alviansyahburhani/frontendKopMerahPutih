// Lokasi: components/FeaturesSlider.tsx
"use client";

import React, { useRef } from "react";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

// Icons
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

// Tipe Data
interface FeatureItem {
  title: string | null;
  description: string | null;
  href: string;
  icon: React.ElementType;
}

interface FeaturesSliderProps {
  title: string | null;
  subtitle: string | null;
  features: FeatureItem[];
  isLoading?: boolean;
}

export default function FeaturesSlider({ title, subtitle, features, isLoading = false }: FeaturesSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  // Skeleton Loading State
  if (isLoading) {
    return (
      <section className="py-20 bg-stone-50 overflow-hidden border-y border-stone-100">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12">
          {/* Kiri Skeleton */}
          <div className="w-full lg:w-1/3 space-y-4">
             <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
             <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
             <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
             <div className="flex gap-4 pt-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
             </div>
          </div>
          {/* Kanan Skeleton */}
          <div className="w-full lg:w-2/3 flex gap-6 overflow-hidden">
             {[1,2,3].map(i => (
                 <div key={i} className="min-w-[300px] h-72 bg-white rounded-xl border border-gray-100 p-8 flex flex-col gap-4 animate-pulse">
                     <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                     <div className="h-6 w-3/4 bg-gray-200 rounded" />
                     <div className="h-4 w-full bg-gray-200 rounded" />
                 </div>
             ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    // [WARNA] bg-stone-50 memberikan nuansa "Putih Tulang"
    <section className="py-20 bg-stone-50 overflow-hidden border-y border-stone-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- BAGIAN KIRI (Header & Controls) --- */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center lg:sticky lg:top-24 h-fit">
            <span className="text-brand-red-600 font-bold tracking-wider uppercase text-sm mb-3">
              Fitur Unggulan
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#212c2f] leading-tight mb-6">
              {title || "Dibangun Sesuai Standar Koperasi"}
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {subtitle || "Platform kami dirancang untuk digitalisasi lengkap alur kerja koperasi, memastikan kepatuhan dan transparansi."}
            </p>

            {/* Navigation Buttons (Merah & Putih) */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-12 h-12 rounded-full border-2 border-brand-red-600 flex items-center justify-center text-brand-red-600 hover:bg-brand-red-600 hover:text-white transition-all duration-300"
                aria-label="Previous Slide"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-12 h-12 rounded-full border-2 border-brand-red-600 flex items-center justify-center text-brand-red-600 hover:bg-brand-red-600 hover:text-white transition-all duration-300"
                aria-label="Next Slide"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* --- BAGIAN KANAN (Slider Cards) --- */}
          <div className="w-full lg:w-2/3 min-w-0">
            <Swiper
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              spaceBetween={24}
              slidesPerView={1.1}
              breakpoints={{
                640: { slidesPerView: 2.1 },
                1024: { slidesPerView: 2.3 },
              }}
              className="!pb-10 !px-1"
            >
              {features.map((item, index) => {
                const Icon = item.icon;
                return (
                  <SwiperSlide key={index} className="h-auto">
                    {/* Card tetap bisa diklik sebagai link, tapi tanpa teks 'Pelajari Lebih Lanjut' */}
                    <Link href={item.href} className="block h-full">
                        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group cursor-pointer relative overflow-hidden">
                            
                            {/* Dekorasi Background Hover (Merah Pudar) */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 opacity-30" />

                            {/* [WARNA] Icon Background: Merah Solid */}
                            <div className="w-16 h-16 rounded-2xl bg-brand-red-600 flex items-center justify-center mb-6 shadow-md shadow-red-200 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                <Icon className="w-8 h-8 text-white" />
                            </div>

                            {/* Judul Card */}
                            <h3 className="text-xl font-bold text-[#212c2f] mb-3 group-hover:text-brand-red-600 transition-colors relative z-10">
                                {item.title}
                            </h3>
                            
                            {/* Deskripsi */}
                            <p className="text-gray-600 leading-relaxed text-sm relative z-10">
                                {item.description}
                            </p>

                            {/* [DIHAPUS] Bagian 'Pelajari lebih lanjut' sudah dihapus sesuai permintaan */}
                        </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

        </div>
      </div>
    </section>
  );
}