// app/(publik)/berita/page.tsx
import { publicService } from '@/services/public.service';
import type { News, ApiErrorResponse } from '@/types/api.types';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

const PAGE_SIZE = 6;

// ============================
// UI KARTU BERITA
// ============================
const NewsCard = ({ item }: { item: News }) => (
  <Link
    href={`/berita/${item.slug}`}
    className="block group border rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden bg-white"
  >
    <div className="relative w-full h-48 bg-gray-200">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          // supaya ga ada warning "fill but no sizes"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          (Tidak ada gambar)
        </div>
      )}
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-500 mb-1">
        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
        {item.title}
      </h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
        {item.excerpt || 'Klik untuk membaca selengkapnya...'}
      </p>
      <span className="text-sm font-semibold text-red-600 mt-4 inline-block">
        Baca Selengkapnya &rarr;
      </span>
    </div>
  </Link>
);

const LatestSidebar = ({ items }: { items: News[] }) => (
  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg sticky top-8">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Berita Terbaru</h2>
    <ul className="space-y-4">
      {items.length === 0 && <p className="text-sm text-gray-500">Tidak ada berita terbaru.</p>}
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          {item.imageUrl && (
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <div>
            <Link
              href={`/berita/${item.slug}`}
              className="font-semibold text-sm text-gray-700 hover:text-red-600 line-clamp-2"
            >
              {item.title}
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

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
        href={`/berita?page=${currentPage - 1}`}
        className={clsx(
          'px-4 py-2 rounded-lg border',
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
        href={`/berita?page=${currentPage + 1}`}
        className={clsx(
          'px-4 py-2 rounded-lg border',
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
// FUNGSI UTAMA PAGE (SUDAH ASYNC SEMUANYA)
// =====================================================
export default async function BeritaIndex({
  searchParams,
}: {
  // perhatikan: sekarang Promise
  searchParams: Promise<{ page?: string }>;
}) {
  // 1) tunggu searchParams dulu
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? '1');

  // 2) tunggu headers() juga
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';

  let items: News[] = [];
  let latest: News[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const [listResult, latestResult] = await Promise.all([
      // ini pakai host tenant, misal: kerenjaya.localhost:3000
      publicService.getPublishedNews(page, PAGE_SIZE, host),
      publicService.getPublishedNews(1, 3, host),
    ]);

    items = listResult.data;
    total = listResult.meta.totalItems;
    latest = latestResult.data;
  } catch (err: any) {
    const apiError = err as ApiErrorResponse;
    error = `[${apiError.statusCode || 500}] ${apiError.message || 'Gagal memuat daftar berita.'}`;
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Warta Koperasi</h1>

          {error && (
            <div className="mt-6 text-center text-red-500 bg-red-100 p-4 rounded-lg">
              <b>Terjadi Kesalahan:</b> {error}
            </div>
          )}

          {!error && items.length === 0 && (
            <div className="mt-6 text-center text-gray-500 bg-gray-100 p-4 rounded-lg">
              Belum ada berita yang dipublikasikan.
            </div>
          )}

          <div className="mt-6 grid sm:grid-cols-2 gap-6">
            {items.map((it) => (
              <NewsCard key={it.id} item={it} />
            ))}
          </div>

          {!error && total > 0 && (
            <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} />
          )}
        </div>

        <div className="lg:col-span-1">
          <LatestSidebar items={latest} />
        </div>
      </div>
    </section>
  );
}
