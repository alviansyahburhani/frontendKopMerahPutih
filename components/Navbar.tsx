"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// Tautan ini sudah benar setelah menggunakan Route Group
const nav = [
  { href: "/", label: "Beranda" },
  { href: "/berita", label: "Berita" },
  { href: "/katalog", label: "Katalog" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <nav className="bg-brand-red-600 text-white">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link href="/" className="text-xl font-extrabold tracking-wide">
            Koperasi Merah Putih
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-brand-red-700"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <ul className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <li key={n.href}>
                <Link className="hover:text-red-100" href={n.href}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              {/* PERUBAHAN DI SINI: Hapus /publik dari tautan Masuk */}
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg border border-white hover:bg-white/10"
              >
                Masuk
              </Link>
            </li>
          </ul>
        </div>
        {/* Mobile menu */}
        <div
          className={clsx(
            "md:hidden border-t border-white/20",
            open ? "block" : "hidden"
          )}
        >
          <ul className="px-4 py-3 space-y-3">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              {/* PERUBAHAN DI SINI: Hapus /publik dari tautan Masuk untuk mobile */}
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="inline-block px-4 py-2 rounded-lg border border-white hover:bg-white/10"
              >
                Masuk
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}