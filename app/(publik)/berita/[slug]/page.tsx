// app/berita/[slug]/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { publicService } from '@/services/public.service';
import type { News, ApiErrorResponse } from '@/types/api.types';

// =============================
// Sidebar Berita Terbaru
// =============================
const LatestSidebar = ({ items }: { items: News[] }) => (
  <aside className="bg-gray-50 border border-gray-200 p-4 rounded-lg sticky top-8">
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
  </aside>
);

// =============================
// PAGE DETAIL
// =============================
export default async function NewsDetail({
  params,
}: {
  // Next sekarang juga kirim params sebagai Promise
  params: Promise<{ slug: string }>;
}) {
  // 1. tunggu params
  const { slug } = await params;

  // 2. tunggu headers()
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';

  let item: News;
  let latest: News[] = [];

  try {
    const [itemResult, latestResult] = await Promise.all([
      publicService.getNewsBySlug(slug, host),
      publicService.getPublishedNews(1, 3, host),
    ]);

    item = itemResult;
    latest = latestResult.data;
  } catch (error: any) {
    const apiError = error as ApiErrorResponse;

    if (apiError.statusCode === 404) {
      return notFound();
    }

    return (
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h1>
          <p className="text-gray-700 mt-4">
            [{apiError.statusCode || 500}] {apiError.message || 'Tidak dapat memuat artikel ini.'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Pastikan server backend berjalan dan dapat diakses.
          </p>
          <Link
            href="/berita"
            className="mt-8 inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Kembali ke Daftar Berita
          </Link>
        </div>
      </section>
    );
  }

  const date = new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ARTIKEL */}
        <article className="lg:col-span-2">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-red-600">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <Link href="/berita" className="hover:text-red-600">
              Warta Koperasi
            </Link>
          </nav>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-800">{item.title}</h1>
          <p className="mt-2 text-gray-500">
            Oleh {item.author?.fullName || 'Admin Koperasi'} | {date}
          </p>

          {item.imageUrl ? (
            <div className="relative w-full aspect-[16/9] mt-6 rounded-xl overflow-hidden border">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                // ini halaman detail → aman kalau priority
                priority
              />
            </div>
          ) : (
            <div className="w-full aspect-[16/9] mt-6 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
              Gambar tidak tersedia
            </div>
          )}

          <div
            className="prose prose-lg max-w-none mt-6"
            dangerouslySetInnerHTML={{
              __html: item.content || '<p>Konten tidak tersedia.</p>',
            }}
          />

          {item.sourceLink && (
            <div className="mt-12 pt-6 border-t">
              <p className="text-gray-600">
                Sumber:
                <a
                  href={item.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline ml-2 break-all"
                >
                  {item.sourceLink}
                </a>
              </p>
            </div>
          )}
        </article>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <LatestSidebar items={latest} />
        </div>
      </div>
    </section>
  );
}
