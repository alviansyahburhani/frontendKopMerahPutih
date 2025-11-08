// Lokasi: components/SubdomainFeatures.tsx
'use client';

import Link from 'next/link';

// Komponen ini berisi desain fitur yang ada di subdomain
export default function SubdomainFeatures() {
  return (
    <section className="py-12 md:py-16 bg-gray-50 border-y">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
        
        {/* Card Simpanan */}
        <Link href="/dashboard/anggota/simpanan">
          <div className="rounded-2xl bg-white p-6 shadow-sm border h-full transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-bold text-brand-red-600">Simpanan</h3>
            <p className="mt-2 text-gray-600">
              Pantau saldo dan histori simpanan dengan transparan.
            </p>
          </div>
        </Link>
        
        {/* Card Pinjaman */}
        <Link href="/dashboard/anggota/pinjaman">
          <div className="rounded-2xl bg-white p-6 shadow-sm border h-full transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-bold text-brand-red-600">Pinjaman</h3>
            <p className="mt-2 text-gray-600">
              Ajukan pinjaman online, proses cepat dan terukur.
            </p>
          </div>
        </Link>
        
        {/* Card Katalog */}
        <Link href="/katalog">
          <div className="rounded-2xl bg-white p-6 shadow-sm border h-full transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-bold text-brand-red-600">Katalog</h3>
            <p className="mt-2 text-gray-600">
              Jelajahi produk/jasa koperasi untuk anggota dan publik.
            </p>
          </div>
        </Link>

      </div>
    </section>
  );
}