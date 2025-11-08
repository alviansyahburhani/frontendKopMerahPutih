'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ==========================================================
// PERBAIKAN DIMULAI DI SINI
// 1. Kita perlu mendefinisikan tipe untuk 'quotes'
// ==========================================================
interface Quote {
  text: string;
  author: string;
}

export interface QuoteFaderProps {
  quotes: Quote[];
}
// ==========================================================

// 2. Terapkan tipe props tersebut ke komponen
const QuoteFader: React.FC<QuoteFaderProps> = ({ quotes }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Pastikan quotes ada dan tidak kosong
    if (!quotes || quotes.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000); // Ganti kutipan setiap 5 detik

    return () => clearInterval(interval);
  }, [quotes]); // Tambahkan quotes sebagai dependency

  // Tampilkan pesan jika array quotes kosong
  if (!quotes || quotes.length === 0) {
    return <p className="text-gray-500 italic">Tidak ada kutipan untuk ditampilkan.</p>;
  }

  // Pastikan quotes[index] ada sebelum mengaksesnya
  const currentQuote = quotes[index];
  if (!currentQuote) {
    return null; // Atau tampilkan fallback
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index} // Kunci animasi adalah index
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute text-center"
        >
          <blockquote className="text-lg italic font-medium text-gray-800">
            &ldquo;{currentQuote.text}&rdquo;
          </blockquote>
          <cite className="block text-right text-gray-600 mt-2 not-italic">
            – {currentQuote.author}
          </cite>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuoteFader;