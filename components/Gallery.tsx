"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox"; // Atau "@/components/Lightbox"

export const GALLERY_IMAGES: string[] = [
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg",
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg",
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg",
];

type Props = {
  images?: string[];
  limit?: number;
};

export default function Gallery({ images = GALLERY_IMAGES, limit }: Props) {
  const data = typeof limit === "number" ? images.slice(0, limit) : images;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {data.map((src, i) => (
          <figure
            key={src + i}
            className="mb-4 break-inside-avoid relative group cursor-zoom-in"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <Image
              src={src}
              alt={`Galeri ${i + 1}`}
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
        images={data}
      />
    </>
  );
}