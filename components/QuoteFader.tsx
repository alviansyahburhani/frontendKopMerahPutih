"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Daftar kutipan yang sama
const quotes = [
  {
    text: "Koperasi adalah alatnya orang lemah... Tapi kalau bersatu, mereka jadi kekuatan...",
    author: "Presiden Prabowo Subianto",
  },
  {
    text: "Koperasi/Kelurahan Merah Putih ini akan menghidupkan kembali semangat ekonomi kerakyatan, selaras dengan nilai yang terkandung dalam Pasal 33 UU 1945.",
    author: "Menteri Koperasi Ferry Juliantono",
  },
  {
    text: "Masa depan ekonomi bangsa ada di tangan usaha-usaha kolektif seperti koperasi yang modern dan terpercaya.",
    author: "Tokoh Ekonomi Nasional",
  },
];

export default function QuoteFader() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Efek untuk mengganti kutipan setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000); // Ganti setiap 5 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 flex items-center justify-center bg-red-50 border-l-4 border-brand-red-600 p-6 rounded-r-lg shadow-inner">
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute"
        >
          <blockquote className="italic text-gray-800 text-lg text-center">
            “{quotes[quoteIndex].text}”
          </blockquote>
          <cite className="block text-center mt-4 font-semibold text-brand-red-700 not-italic">
            – {quotes[quoteIndex].author}
          </cite>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}