"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react"; // 1. Impor hooks
import clsx from "clsx";
import { publicService } from "@/services/public.service"; // <-- TAMBAHKAN
import { superAdminService } from "@/services/superadmin.service";
// 2. Definisikan link untuk kedua kondisi
const tenantNav = [
  { href: "/", label: "Beranda" },
  { href: "/berita", label: "Berita" },
  { href: "/katalog", label: "Katalog" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

const mainDomainNav = [
  { href: "/", label: "Beranda" },
  { href: "/berita", label: "Berita" },
  // Katalog & Galeri dihilangkan
  { href: "/kontak", label: "Kontak" },
];

// 3. Definisikan domain utama Anda
// (Berdasarkan file app/(publik)/page.tsx dan services/public.service.ts)
const MAIN_DOMAINS = [
  'localhost',
  'sistemkoperasi.id' // Ganti jika domain produksi Anda berbeda
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Koperasi Merah Putih");
  // 4. Tambah state untuk menentukan apakah ini domain utama
  const [isMainDomain, setIsMainDomain] = useState(false);

  // 5. Gunakan useEffect untuk cek hostname di sisi client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const mainDomain = MAIN_DOMAINS.includes(hostname);
      setIsMainDomain(mainDomain);

      // --- MODIFIKASI: Panggil API berdasarkan domain ---
      if (mainDomain) {
        // Jika di domain utama, panggil pengaturan Super Admin
        superAdminService.getPublicPlatformSettings()
          .then(settings => {
            // Backend Anda mengembalikan { settingValue: '...' }
            setDisplayName(settings.settingValue || "Platform Koperasi");
          })
          .catch(err => {
            console.error("Gagal fetch platform settings:", err);
            setDisplayName("Platform Koperasi"); // Fallback
          });
      } else {
        // Jika di subdomain, panggil profil koperasi tenant
        publicService.getPublicCooperativeProfile()
          .then(profile => {
            setDisplayName(profile.displayName || "Koperasi Merah Putih");
          })
          .catch(err => {
            console.error("Gagal fetch cooperative profile:", err);
            setDisplayName("Koperasi"); // Fallback
          });
      }
    }
    }, []); // [] berarti hanya berjalan sekali saat komponen dimuat

  // 6. Tentukan link dan tombol CTA mana yang akan digunakan
  const navLinks = isMainDomain ? mainDomainNav : tenantNav;

  const CtaButton = () => {
    if (isMainDomain) {
      // Tombol untuk "Daftarkan Koperasi Anda"
      return (
        <Link
          href="/auth/daftar-koperasi" // Link ke pendaftaran koperasi
          className="px-4 py-2 rounded-lg border border-white hover:bg-white/10"
        >
          Daftarkan Koperasi Anda
        </Link>
      );
    }
    // Tombol "Masuk" (default untuk tenant)
    return (
      <Link
        href="/auth/login" // Link ke login biasa
        className="px-4 py-2 rounded-lg border border-white hover:bg-white/10"
      >
        Masuk
      </Link>
    );
  };

  const CtaButtonMobile = () => {
    if (isMainDomain) {
      return (
        <Link
          href="/auth/daftar-koperasi"
          onClick={() => setOpen(false)}
          className="inline-block px-4 py-2 rounded-lg border border-white hover:bg-white/10"
        >
          Daftarkan Koperasi Anda
        </Link>
      );
    }
    return (
      <Link
        href="/auth/login"
        onClick={() => setOpen(false)}
        className="inline-block px-4 py-2 rounded-lg border border-white hover:bg-white/10"
      >
        Masuk
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <nav className="bg-brand-red-600 text-white">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link href="/" className="text-xl font-extrabold tracking-wide">
            {displayName}
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-brand-red-700"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          {/* 7. Render navigasi & tombol CTA dinamis */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((n) => (
              <li key={n.href}>
                <Link className="hover:text-red-100" href={n.href}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <CtaButton />
            </li>
          </ul>
        </div>

        {/* 8. Render menu mobile dinamis */}
        <div
          className={clsx(
            "md:hidden border-t border-white/20",
            open ? "block" : "hidden"
          )}
        >
          <ul className="px-4 py-3 space-y-3">
            {navLinks.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <CtaButtonMobile />
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}