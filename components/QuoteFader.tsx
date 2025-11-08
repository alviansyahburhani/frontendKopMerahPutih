// Lokasi: components/QuoteFader.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// 1. Tipe data Quote (tetap sama)
interface Quote {
  text: string;
  author: string;
}

// 2. [PERBAIKAN] Tipe Props sekarang menerima KEDUA jenis prop
export interface QuoteFaderProps {
  /** Dipakai oleh app/(superadmin)/settings/page.tsx (Pratinjau) */
  quotes?: Quote[];
  
  /** Dipakai oleh app/(publik)/page.tsx (Data Live) */
  quotesJsonString?: string;
  isMainDomain?: boolean;
}

// 3. Data statis untuk fallback (jika di subdomain atau parsing gagal)
const staticSubdomainQuotes: Quote[] = [
  { text: "Koperasi adalah soko guru perekonomian.", author: "Bung Hatta" },
  { text: "Membangun usaha bersama untuk kesejahteraan bersama.", author: "Visi Koperasi" },
];

const QuoteFader: React.FC<QuoteFaderProps> = ({ 
  quotes,             // Prop dari settings/page.tsx
  quotesJsonString,   // Prop dari (publik)/page.tsx
  isMainDomain        // Prop dari (publik)/page.tsx
}) => {
  const [index, setIndex] = useState(0);
  const [activeQuotes, setActiveQuotes] = useState<Quote[]>([]); // State internal

  // 4. [PERBAIKAN] useEffect ini memproses prop yang masuk menjadi state 'activeQuotes'
  useEffect(() => {
    // PRIORITAS 1: Jika prop 'quotes' (array) diberikan.
    // Ini digunakan oleh halaman settings/page.tsx untuk pratinjau.
    if (quotes && Array.isArray(quotes)) {
      setActiveQuotes(quotes.length > 0 ? quotes : staticSubdomainQuotes); 
      return;
    }

    // PRIORITAS 2: Jika di domain utama (isMainDomain = true).
    // Ini digunakan oleh app/(publik)/page.tsx.
    if (isMainDomain) {
      try {
        const parsedQuotes = JSON.parse(quotesJsonString || '[]');
        if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
          setActiveQuotes(parsedQuotes);
        } else {
          setActiveQuotes(staticSubdomainQuotes); // Fallback jika JSON kosong/invalid
        }
      } catch (error) {
        console.error("Gagal parsing JSON quotes:", error);
        setActiveQuotes(staticSubdomainQuotes); // Fallback jika JSON error
      }
    } else {
      // PRIORITAS 3: Jika di subdomain (isMainDomain = false atau undefined).
      setActiveQuotes(staticSubdomainQuotes);
    }
  }, [quotes, quotesJsonString, isMainDomain]); // Dievaluasi ulang jika ada prop berubah

  // useEffect untuk animasi cycling (bergantung pada state internal)
  useEffect(() => {
    if (!activeQuotes || activeQuotes.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % activeQuotes.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [activeQuotes]);

  // Fallback jika tidak ada quotes
  if (!activeQuotes || activeQuotes.length === 0) {
    return <p className="text-gray-500 italic">Tidak ada kutipan untuk ditampilkan.</p>;
  }

  const currentQuote = activeQuotes[index];
  if (!currentQuote) return null;

  return (
    // =========================================================
    // PERBAIKAN CSS DI SINI: ganti 'h-full' dengan 'min-h-[100px]'
    // Ini memberikan tinggi minimal agar komponen terlihat
    // =========================================================
    <div className="relative w-full min-h-[100px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute text-center"
        >
          <blockquote className="text-lg italic font-medium text-gray-800">
            &ldquo;{currentQuote.text}&rdquo;
          </blockquote>
          {/* Menggunakan style dari gambar screenshot Anda */}
          <cite className="block text-right mt-2 not-italic font-semibold text-brand-red-600">
            — {currentQuote.author}
          </cite>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuoteFader;