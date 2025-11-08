// Lokasi: app/(publik)/fitur/[slug]/page.tsx
import { getBukuData, BUKU_DATA } from '@/lib/buku-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/Button'; // Asumsi komponen Button ada

// Props untuk halaman dinamis
interface FiturDetailPageProps {
  params: {
    slug: string;
  };
}

export default function FiturDetailPage({ params }: FiturDetailPageProps) {
  const { slug } = params;
  const data = getBukuData(slug);

  // Jika slug tidak ditemukan di database kita, tampilkan 404
  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white text-gray-800">
      
      {/* 1. Hero Section */}
      <section className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-red-100 text-brand-red-700 font-semibold text-sm mb-4">
            {data.nomorBuku}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {data.namaBuku}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {data.deskripsiSingkat}
          </p>
        </div>
      </section>

      {/* 2. Manfaat Utama */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.manfaat.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.judul} className="p-6 bg-white rounded-lg">
                  <div className="p-3 bg-brand-red-100 rounded-full w-12 h-12 inline-flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-red-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.judul}</h3>
                  <p className="text-gray-600">{item.poin}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Detail Fitur & Gambar */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Kolom Kiri: Detail Fitur */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {data.detailFitur.judul}
            </h2>
            <ul className="space-y-4">
              {data.detailFitur.poin.map((poin, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  <span className="text-gray-700">{poin}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom Kanan: Gambar Screenshot */}
          <div className="relative w-full h-80 lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={data.gambarHero} // <-- Mengambil gambar dari data
              alt={`Tampilan ${data.namaBuku}`}
              fill
              className="object-cover object-top"
              // Anda mungkin perlu menambahkan domain gambar ke next.config.js jika dari eksternal
              // unoptimized={true} // Gunakan ini jika path-nya statis di /public
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 4. Call to Action (CTA) */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-red-600 mb-4">
            Siap Mendigitalkan Koperasi Anda?
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Bergabunglah dengan platform kami dan rasakan kemudahan mengelola 
            administrasi koperasi sesuai standar.
          </p>
          <Link href="/auth/daftar-koperasi">
            <Button size="lg" className="w-full sm:w-auto">
              Daftarkan Koperasi Anda Sekarang
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}

// Opsional: Bantu Next.js membuat halaman statis
export async function generateStaticParams() {
  const slugs = Object.keys(BUKU_DATA);
  return slugs.map(slug => ({
    slug: slug,
  }));
}