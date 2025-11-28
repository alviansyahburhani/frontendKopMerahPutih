"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox"; // Atau "@/components/Lightbox"

// --- [BARU] Tipe data untuk gambar ---
type GalleryImage = {
  src: string;
  alt: string;
};

// --- [HAPUS] Mock data (GALLERY_IMAGES) tidak lagi digunakan ---

// --- [MODIFIKASI] Tipe Props ---
type Props = {
  images?: GalleryImage[]; // Sekarang menerima array objek
  limit?: number;
};

// --- [MODIFIKASI] Default props dikosongkan ---
export default function Gallery({ images = [], limit }: Props) {
  const data = typeof limit === "number" ? images.slice(0, limit) : images;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // --- [BARU] Siapkan array string untuk Lightbox ---
  // Komponen Lightbox masih mengharapkan array string (URL)
  const lightboxImages = data.map((img) => img.src);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {/* --- [MODIFIKASI] Mapping --- */}
        {data.map((img, i) => (
          <figure
            key={img.src + i} // Gunakan img.src sebagai key
            className="mb-4 break-inside-avoid relative group cursor-zoom-in"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <Image
              src={img.src}   // <-- Perbaikan 1: Gunakan img.src
              alt={img.alt}   // <-- Perbaikan 2: Gunakan img.alt
              width={1200}
              height={800}
              className="w-full h-auto rounded-xl shadow transition-transform group-hover:scale-[1.01]"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority={i < 3}
            />
            <figcaption className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-black/20" />
          </figure>
        ))}
      </div>

      <Lightbox
        open={open}
        index={index}
        setOpen={setOpen}
        setIndex={setIndex}
        images={lightboxImages} // <-- Perbaikan 3: Kirim array string (URL)
      />
    </>
  );
}