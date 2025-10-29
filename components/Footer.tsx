// File: frontend/components/layout/Footer.tsx

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-red-600 text-white">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Kolom 1 */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">
            Koperasi Merah Putih
          </h3>
          <p className="text-sm leading-relaxed">
            Keterangan singkat tentang koperasi. Bisa diganti sesuai kebutuhan
            kamu, misalnya visi & misi koperasi.
          </p>
        </div>

        {/* Kolom 2: Tautan Cepat (BAGIAN YANG DIPERBAIKI) */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Tautan Cepat</h3>
          <ul className="space-y-2 text-sm">
            {/* Link-link ini sekarang menggunakan path yang benar */}
            <li><Link href="/" className="hover:text-red-400">Beranda</Link></li>
            <li><Link href="#" className="hover:text-red-400">Tentang Kami</Link></li>
            <li><Link href="/katalog" className="hover:text-red-400">Produk & Layanan</Link></li>
            <li><Link href="/berita" className="hover:text-red-400">Berita</Link></li>
            <li><Link href="/kontak" className="hover:text-red-400">Kontak</Link></li>
          </ul>
        </div>

        {/* Kolom 3 */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Kontak Kami</h3>
          <p className="text-sm">Jalan Koperasi No. 123, Bandung</p>
          <p className="text-sm">Telepon: (022) 1234567</p>
          <p className="text-sm">Email: info@koperasimerahputih.id</p>
        </div>

        {/* Kolom 4 */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Ikuti Kami</h3>
          <div className="flex gap-4">
            <Link href="https://facebook.com" target="_blank" className="hover:text-red-400">
              <Facebook size={20} />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-red-400">
              <Instagram size={20} />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-red-400">
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 text-center text-sm text-gray-300 py-4">
        © {new Date().getFullYear()} Koperasi Merah Putih. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}