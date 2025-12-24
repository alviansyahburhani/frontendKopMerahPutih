// Lokasi: frontend/lib/imageUtils.ts

// Ambil URL Backend dari environment variable atau fallback ke localhost:3002
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";

export const getFullImageUrl = (url?: string | null): string => {
  // 1. Jika null/undefined/kosong, kembalikan gambar placeholder
  if (!url || url.trim() === "") {
    return "/images/merahputih-rmv.png"; // Pastikan path placeholder ini benar di folder public Anda
  }

  // 2. Jika url sudah lengkap (misal dari Cloudflare R2 / AWS S3 / Google Drive), biarkan saja
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 3. Jika path relatif (misal: "tenants/..." atau "/uploads/..."), tambahkan Base URL Backend
  // Hapus slash di depan jika ada, untuk menghindari double slash //
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  
  return `${API_BASE_URL}/${cleanPath}`;
};