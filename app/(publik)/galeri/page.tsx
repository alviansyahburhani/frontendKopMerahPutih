// Lokasi: alviansyahburhani/frontendkopmerahputih/frontendKopMerahPutih-2d28dba419adfcc919625f86c3f6e3cf404c0119/app/(publik)/galeri/page.tsx

import Gallery from "@/components/Gallery"; // Komponen UI Galeri Anda
import { headers } from "next/headers";
import { publicService } from "@/services/public.service";
import type { GalleryItem } from "@/types/api.types";
import { AlertTriangle, ImageOff } from "lucide-react";

// Tipe data yang diharapkan oleh komponen <Gallery>
type GalleryImage = {
  src: string;
  alt: string;
};

// Komponen untuk menampilkan error
const GalleryError = ({ message }: { message: string }) => (
  <div className="mt-12 flex flex-col items-center justify-center text-center text-red-600 bg-red-50 p-8 rounded-lg border border-red-200">
    <AlertTriangle size={48} className="mb-4" />
    <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
    <p className="text-red-700">{message}</p>
  </div>
);

// Komponen untuk galeri kosong
const EmptyGallery = () => (
   <div className="mt-12 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 p-8 rounded-lg border border-gray-200">
    <ImageOff size={48} className="mb-4" />
    <h2 className="text-xl font-bold">Galeri Masih Kosong</h2>
    <p>Belum ada foto yang diunggah oleh pengurus.</p>
  </div>
);


export default async function GaleriPage() {
  
  let imagesForGallery: GalleryImage[] = [];
  let error: string | null = null;

  try {
    // 1. Dapatkan host (untuk multi-tenancy)
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';

    // 2. Panggil service untuk mengambil data
    // Kita ambil 100 gambar, diurutkan berdasarkan 'order' lalu 'createdAt' oleh backend
    const galleryResult = await publicService.getPublicGallery(host, 1, 100);
    const items = galleryResult.data;

    // 3. Mapping data dari Tipe Backend (GalleryItem) ke Tipe Frontend (GalleryImage)
    imagesForGallery = items.map((item: GalleryItem) => ({
      src: item.imageUrl, // 'imageUrl' dari backend
      alt: item.description || "Foto Galeri Koperasi" // 'description' dari backend
    }));

  } catch (err: any) {
    console.error("Gagal memuat galeri publik:", err);
    error = err.message || "Tidak dapat memuat data galeri saat ini.";
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-brand-red-600">Galeri Lengkap</h1>
        <p className="mt-2 text-gray-600">Semua dokumentasi kegiatan koperasi.</p>

        <div className="mt-6">
          {error && <GalleryError message={error} />}
          
          {!error && imagesForGallery.length === 0 && <EmptyGallery />}

          {!error && imagesForGallery.length > 0 && (
            // Kirim data yang sudah di-mapping ke komponen UI Anda
            <Gallery images={imagesForGallery} />
          )}
        </div>
      </div>
    </section>
  );
}