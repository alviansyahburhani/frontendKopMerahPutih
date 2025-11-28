"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { publicService } from "@/services/public.service";
import { superAdminService } from "@/services/superadmin.service";

// 1. Link Navigasi
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
  { href: "/kontak", label: "Kontak" },
];

const MAIN_DOMAINS = ['localhost', 'sistemkoperasi.id'];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(""); // Kosongkan dulu agar tidak 'glitch' teks
  
  // 2. STATE LOADING (Penting!)
  const [isCheckingDomain, setIsCheckingDomain] = useState(true);
  const [isMainDomain, setIsMainDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const mainDomain = MAIN_DOMAINS.includes(hostname);
      
      setIsMainDomain(mainDomain);
      // PENTING: Jangan matikan loading di sini, tapi biarkan
      // loading tetap jalan sampai kita minimal tahu nama display-nya (opsional),
      // TAPI untuk UX cepat, kita matikan isCheckingDomain di sini agar layout menu muncul,
      // sedangkan nama bisa loading belakangan.
      setIsCheckingDomain(false); 

      // --- FETCH DATA ---
      if (mainDomain) {
        superAdminService.getPublicPlatformSettings()
          .then(settings => setDisplayName(settings.settingValue || "Platform Koperasi"))
          .catch(err => {
             console.error(err); 
             setDisplayName("Platform Koperasi");
          });
      } else {
        publicService.getPublicCooperativeProfile()
          .then(profile => setDisplayName(profile.displayName || "Koperasi Merah Putih"))
          .catch(err => {
             console.error(err); 
             setDisplayName("Koperasi Merah Putih");
          });
      }
    }
  }, []);

  // 3. Tentukan Navigasi
  const navLinks = isMainDomain ? mainDomainNav : tenantNav;

  // 4. Komponen CTA (Tombol Aksi)
  const CtaButton = ({ mobile = false }: { mobile?: boolean }) => {
    const baseClass = mobile 
      ? "inline-block px-4 py-2 rounded-lg border border-white hover:bg-white/10"
      : "px-4 py-2 rounded-lg border border-white hover:bg-white/10 transition-colors";

    if (isMainDomain) {
      return (
        <Link href="/auth/daftar-koperasi" onClick={() => mobile && setOpen(false)} className={baseClass}>
          Daftarkan Koperasi Anda
        </Link>
      );
    }
    return (
      <Link href="/auth/login" onClick={() => mobile && setOpen(false)} className={baseClass}>
        Masuk
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <nav className="bg-brand-red-600 text-white transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          
          {/* LOGO AREA */}
          <Link href="/" className="text-xl font-extrabold tracking-wide flex items-center min-h-[30px]">
             {/* Jika nama belum dimuat, tampilkan skeleton bar putih transparan */}
             {!displayName ? (
                 <div className="h-6 w-40 bg-white/20 rounded animate-pulse" />
             ) : (
                 displayName
             )}
          </Link>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-brand-red-700 focus:outline-none"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          {/* DESKTOP NAV */}
          <ul className="hidden md:flex items-center gap-6">
            {isCheckingDomain ? (
                // SKELETON LOAD UNTUK MENU (Agar tidak berkedip antar menu tenant/main)
                <>
                   {[1, 2, 3, 4].map((i) => (
                       <li key={i}><div className="h-4 w-16 bg-white/20 rounded animate-pulse" /></li>
                   ))}
                   <li><div className="h-9 w-24 bg-white/20 rounded-lg animate-pulse" /></li>
                </>
            ) : (
                // MENU ASLI
                <>
                    {navLinks.map((n) => (
                    <li key={n.href}>
                        <Link className="hover:text-red-100 font-medium transition-colors" href={n.href}>
                        {n.label}
                        </Link>
                    </li>
                    ))}
                    <li>
                        <CtaButton />
                    </li>
                </>
            )}
          </ul>
        </div>

        {/* MOBILE NAV (Dropdown) */}
        <div
          className={clsx(
            "md:hidden border-t border-white/10 bg-brand-red-700 overflow-hidden transition-all duration-300 ease-in-out",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ul className="px-4 py-4 space-y-4">
             {isCheckingDomain ? (
                 // Skeleton Mobile
                 [1,2,3].map(i => <div key={i} className="h-4 w-1/3 bg-white/20 rounded animate-pulse mb-3"/>)
             ) : (
                 <>
                    {navLinks.map((n) => (
                        <li key={n.href}>
                            <Link href={n.href} onClick={() => setOpen(false)} className="block hover:translate-x-1 transition-transform">
                            {n.label}
                            </Link>
                        </li>
                    ))}
                    <li className="pt-2">
                        <CtaButton mobile />
                    </li>
                 </>
             )}
          </ul>
        </div>
      </nav>
    </header>
  );
}