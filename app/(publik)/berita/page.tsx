// Lokasi: app/(publik)/katalog/page.tsx
import { publicService } from '@/services/public.service';
import type { Product, ApiErrorResponse } from '@/types/api.types';
import { getFullImageUrl } from '@/lib/imageUtils'; // Helper gambar kita
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { ShoppingCart, Tag } from 'lucide-react'; // Icon keranjang

const PAGE_SIZE = 8; // Menampilkan 8 produk per halaman

// ============================
// UI KARTU PRODUK (ADAPTASI DARI NEWS CARD)
// ============================
const CatalogCard = ({ item }: { item: Product }) => {
  const isAvailable = item.isAvailable;
  
  // Format Harga Rupiah
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(item.price);

  return (
    <div className="block group border rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden bg-white flex flex-col h-full relative">
      {/* Label Status di Pojok Kanan Atas Gambar */}
      <div className="absolute top-2 right-2 z-10">
        <span className={clsx(
          "px-2 py-1 text-xs font-bold rounded-full shadow-sm",
          isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          {isAvailable ? "Tersedia" : "Habis"}
        </span>
      </div>

      <Link href={`/katalog/${item.slug}`} className="relative w-full h-48 bg-gray-200 block">
        <Image
          src={getFullImageUrl(item.imageUrl)} // Gunakan helper URL
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized={true} // Wajib true agar gambar backend muncul
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {/* Kategori */}
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <Tag size={12} />
          {item.category?.name || "Umum"}
        </p>

        {/* Judul Produk */}
        <Link href={`/katalog/${item.slug}`}>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2" title={item.name}>
            {item.name}
          </h3>
        </Link>

        {/* Harga */}
        <p className="text-lg font-extrabold text-brand-red-600 mt-2">
           {formattedPrice}
        </p>
        
        <div className="mt-auto pt-4">
          {/* TOMBOL KERANJANG (Hanya Tampilan Visual / Link ke Detail) */}
          <Link 
            href={`/katalog/${item.slug}`} // Bisa diarahkan ke fungsi add-to-cart nantinya
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors",
              isAvailable 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            aria-disabled={!isAvailable}
          >
            <ShoppingCart size={18} />
            <span>{isAvailable ? "Tambah Keranjang" : "Stok Habis"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================
// SIDEBAR PRODUK TERBARU
// ============================
const LatestSidebar = ({ items }: { items: Product[] }) => (
  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg sticky top-24">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Produk Terbaru</h2>
    <ul className="space-y-4">
      {items.length === 0 && <p className="text-sm text-gray-500">Tidak ada produk terbaru.</p>}
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-100">
            <Image
              src={getFullImageUrl(item.imageUrl)}
              alt={item.name}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={true}
            />
          </div>
          <div>
            <Link
              href={`/katalog/${item.slug}`}
              className="font-semibold text-sm text-gray-700 hover:text-red-600 line-clamp-2"
            >
              {item.name}
            </Link>
            <p className="text-xs font-bold text-red-600 mt-1">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// ============================
// KOMPONEN PAGINATION
// ============================
const Pagination = ({
  total,
  pageSize,
  currentPage,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex justify-center items-center gap-2">
      <Link
        href={`/katalog?page=${currentPage - 1}`}
        className={clsx(
          'px-4 py-2 rounded-lg border',
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'bg-white text-gray-700 hover:bg-gray-50',
        )}
        aria-disabled={currentPage === 1}
      >
        &larr; Sebelumnya
      </Link>
      <span className="text-sm text-gray-600 mx-2">
        Halaman {currentPage} dari {totalPages}
      </span>
      <Link
        href={`/katalog?page=${currentPage + 1}`}
        className={clsx(
          'px-4 py-2 rounded-lg border',
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'bg-white text-gray-700 hover:bg-gray-50',
        )}
        aria-disabled={currentPage === totalPages}
      >
        Berikutnya &rarr;
      </Link>
    </div>
  );
};

// =====================================================
// FUNGSI UTAMA PAGE (ASYNC)
// =====================================================
export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? '1');

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';

  let items: Product[] = [];
  let latest: Product[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    // Fetch data produk (List Utama & Sidebar Terbaru) secara paralel
    const [listResult, latestResult] = await Promise.all([
      publicService.getPublishedProducts(page, PAGE_SIZE, host),
      publicService.getPublishedProducts(1, 5, host), // Ambil 5 produk terbaru untuk sidebar
    ]);

    items = listResult.data;
    total = listResult.meta.totalItems;
    latest = latestResult.data;
  } catch (err: any) {
    const apiError = err as ApiErrorResponse;
    error = `[${apiError.statusCode || 500}] ${apiError.message || 'Gagal memuat katalog produk.'}`;
    console.error("Error loading catalog:", err);
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === KOLOM UTAMA (DAFTAR PRODUK) === */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Katalog Produk</h1>
              <p className="text-gray-500 mt-1">Temukan produk dan jasa terbaik dari koperasi.</p>
            </div>
          </div>

          {error && (
            <div className="mt-6 text-center text-red-500 bg-red-100 p-4 rounded-lg">
              <b>Terjadi Kesalahan:</b> {error}
            </div>
          )}

          {!error && items.length === 0 && (
            <div className="mt-6 text-center text-gray-500 bg-gray-100 p-10 rounded-lg">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p>Belum ada produk yang tersedia saat ini.</p>
            </div>
          )}

          {/* Grid Produk (Menggunakan style NewsCard tapi 2 kolom di mobile/desktop) */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </div>

          {!error && total > 0 && (
            <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} />
          )}
        </div>

        {/* === SIDEBAR (PRODUK TERBARU) === */}
        <div className="lg:col-span-1">
          <LatestSidebar items={latest} />
          
          {/* Banner Promo / Info Tambahan (Opsional) */}
          <div className="mt-8 bg-red-50 border border-red-100 p-5 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">Butuh Bantuan?</h3>
            <p className="text-sm text-red-700 mb-4">
              Jika Anda kesulitan melakukan pemesanan, silakan hubungi admin kami via WhatsApp.
            </p>
            <a href="#" className="block w-full py-2 bg-red-600 text-white text-center rounded-lg font-semibold hover:bg-red-700 transition">
              Hubungi Admin
            </a>
          </div>
        </div>
        
      </div>
    </section>
  );
}