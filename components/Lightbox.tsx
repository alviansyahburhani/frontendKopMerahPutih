"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  index: number;
  setOpen: (v: boolean) => void;
  setIndex: (updater: number | ((prev: number) => number)) => void;
  images: string[];
};

export default function Lightbox({ open, index, setOpen, setIndex, images }: Props) {
  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((prev) => (prev - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((prev) => (prev + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, setOpen, setIndex]);

  if (!open) return null;

  const prev = () => setIndex((p) => (p - 1 + images.length) % images.length);
  const next = () => setIndex((p) => (p + 1) % images.length);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop (klik untuk close) */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Tombol Close */}
      <button
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 z-10 text-white/90 hover:text-white"
      >
        <X size={28} />
      </button>

      {/* Konten */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        {/* Prev */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="z-10 mr-3 text-white/85 hover:text-white"
        >
          <ChevronLeft size={40} />
        </button>

        {/* Image wrapper harus relative untuk Image fill */}
        <div className="relative w-full max-w-5xl aspect-[16/10] z-0">
          <Image
            src={images[index]}
            alt={`Galeri ${index + 1}`}
            fill
            className="object-contain rounded-xl"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </div>

        {/* Next */}
        <button
          aria-label="Next"
          onClick={next}
          className="z-10 ml-3 text-white/85 hover:text-white"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
}
