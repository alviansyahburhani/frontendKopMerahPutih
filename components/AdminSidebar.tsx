"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, UserPlus, Users, BookUser, Shield, Briefcase, Landmark, HandCoins,
  Archive, BookOpen, FileText, MessageSquare, Award, Building, ClipboardList, Mail,
  History, Settings, X, LogOut, BookMarked, Globe, LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { authService } from "@/services/auth.service";
import { JwtPayload } from "@/types/api.types";

/* =========================
   Tipe Data Navigasi
========================= */
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  links: NavItem[];
}

type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userData: JwtPayload | null;
  isBendahara?: boolean;
};

/* =========================
   Data menu (dari kode Anda)
========================= */
const bukuKoperasiGroups: NavGroup[] = [
  {
    title: "Manajemen Utama",
    links: [
      { href: "/dashboard/admin", label: "Dashboard", icon: LayoutGrid },
      { href: "/dashboard/admin/persetujuan-anggota", label: "Persetujuan Anggota", icon: UserPlus },
      { href: "/dashboard/admin/daftar-anggota", label: "Daftar Anggota", icon: Users },
      { href: "/dashboard/admin/daftar-pengurus", label: "Daftar Pengurus", icon: BookUser },
      { href: "/dashboard/admin/daftar-pengawas", label: "Daftar Pengawas", icon: Shield }, // Ganti ikon jika perlu
      { href: "/dashboard/admin/daftar-karyawan", label: "Daftar Karyawan", icon: Briefcase },
    ],
  },
  {
    title: "Keuangan",
    links: [
      { href: "/dashboard/admin/simpanan-anggota", label: "Simpanan Anggota", icon: Landmark },
      { href: "/dashboard/admin/pinjaman-anggota", label: "Pinjaman Anggota", icon: HandCoins },
    ],
  },
  {
    title: "Administrasi & Arsip",
    links: [
      { href: "/dashboard/admin/daftar-inventaris", label: "Daftar Inventaris", icon: Archive },
      { href: "/dashboard/admin/buku-tamu", label: "Buku Tamu", icon: BookOpen },
      { href: "/dashboard/admin/notulen-rapat-anggota", label: "Notulen Rapat Anggota", icon: FileText },
      { href: "/dashboard/admin/notulen-rapat-pengurus", label: "Notulen Rapat Pengurus", icon: FileText },
      { href: "/dashboard/admin/notulen-rapat-pengawas", label: "Notulen Rapat Pengawas", icon: FileText },
      { href: "/dashboard/admin/saran-anggota", label: "Saran Anggota", icon: MessageSquare },
      { href: "/dashboard/admin/saran-pengawas", label: "Saran Pengawas", icon: Award }, // Mungkin ganti ikon
      { href: "/dashboard/admin/anjuran-pejabat", label: "Anjuran Pejabat", icon: Building },
      { href: "/dashboard/admin/catatan-kejadian", label: "Catatan Kejadian", icon: ClipboardList },
      { href: "/dashboard/admin/agenda-ekspedisi", label: "Agenda & Ekspedisi", icon: Mail },
    ],
  },
];

const aplikasiGroups: NavGroup[] = [
  {
    title: "Manajemen Website",
    links: [
      { href: "/dashboard/admin/website/berita", label: "Berita & Artikel", icon: FileText }, // Ganti ikon jika perlu
      { href: "/dashboard/admin/website/katalog", label: "Katalog Produk", icon: Landmark }, // Ganti ikon jika perlu
      { href: "/dashboard/admin/website/galeri", label: "Galeri Foto", icon: Users },      // Ganti ikon jika perlu
      { href: "/dashboard/admin/website/kontak", label: "Info Kontak", icon: Mail },        // Ganti ikon jika perlu
    ],
  },
  {
    title: "Sistem & Keamanan",
    links: [
      { href: "/dashboard/admin/sistem/log-audit", label: "Log Aktivitas", icon: History },
      { href: "/dashboard/admin/sistem/pengaturan", label: "Pengaturan Akun", icon: Settings },
    ],
  },
];

/* =========================
   Komponen NavLink (memoized - dari kode Anda)
========================= */
const NavLink = memo(function NavLink({
  // ... (Kode NavLink Anda tetap sama) ...
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        isActive
          ? "bg-white text-brand-red-700 shadow"
          : "text-red-100 hover:bg-white/20 hover:text-white"
      )}
    >
      <Icon size={18} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
});

/* =========================
   Sidebar
========================= */
export default function AdminSidebar({
  isSidebarOpen,
  toggleSidebar,
  userData,
  isBendahara = false,
}: Props) {
  const pathname = usePathname();
  const filteredBukuGroups = isBendahara
    ? []
    : bukuKoperasiGroups.filter((g) => g.title !== 'Keuangan');

  const handleLogout = () => {
    console.log("Logging out (Admin)...");
    authService.logout();
  };

  const handleItemClick = () => {
    if (isSidebarOpen) toggleSidebar();
  };

  return (
    <>
      {/* Backdrop mobile */}
      <div
        onClick={toggleSidebar}
        className={clsx(
          "fixed inset-0 bg-black/50 z-30 md:hidden",
          isSidebarOpen ? "block" : "hidden"
        )}
      />

      {/* --- Aside diatur sebagai flex container vertikal --- */}
      <aside
        className={clsx(
          // --- Tinggi penuh layar (h-screen atau inset-y-0) ---
          "fixed inset-y-0 left-0 w-72 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header (Tidak berubah, tinggi otomatis) */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0"> {/* Tambah flex-shrink-0 */}
          <div>
            <h2 className="text-xl font-bold">Panel Pengurus</h2>
            <span className="text-sm text-red-200">
              {userData?.fullName || 'Koperasi Digital'}
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded hover:bg-white/10"
            aria-label="Tutup menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* --- Navigasi (Ambil sisa ruang & bisa scroll) --- */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto"> {/* <-- Tambah flex-1 dan overflow-y-auto */}
          {/* Buku Administrasi */}
          {!isBendahara && (
          <div className="space-y-4">
            <div className="px-3 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-red-200" />
              <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">
                Buku Administrasi
              </h3>
            </div>
            {filteredBukuGroups.map((group) => (
              <div key={group.title}>
                <h4 className="px-3 mb-2 text-xs font-semibold uppercase text-red-200">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.links.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href))}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          )}

          {!isBendahara && (<hr className="my-6 border-white/10" />)}

          {/* Aplikasi & Sistem */}
          {!isBendahara && (
          <div className="space-y-4">
            <div className="px-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-200" />
              <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">
                Aplikasi & Sistem
              </h3>
            </div>
            {aplikasiGroups.map((group) => (
              <div key={group.title}>
                <h4 className="px-3 mb-2 text-xs font-semibold uppercase text-red-200">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.links.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href))}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Keuangan khusus Bendahara */}
          {isBendahara && (
          <div className="space-y-3 mt-2">
            <div className="px-3 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-red-200" />
              <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">Keuangan</h3>
            </div>
            <div>
              <h4 className="px-3 mb-2 text-xs font-semibold uppercase text-red-200">Menu</h4>
              <div className="space-y-1">
                <NavLink
                  item={{ href: "/dashboard/admin/simpanan-anggota", label: "Simpanan Anggota", icon: Landmark }}
                  isActive={pathname?.startsWith("/dashboard/admin/simpanan-anggota")}
                  onClick={handleItemClick}
                />
                <NavLink
                  item={{ href: "/dashboard/admin/pinjaman-anggota", label: "Pinjaman Anggota", icon: HandCoins }}
                  isActive={pathname?.startsWith("/dashboard/admin/pinjaman-anggota")}
                  onClick={handleItemClick}
                />
              </div>
            </div>
          </div>
          )}
        </nav>
        {/* --- Selesai bagian Navigasi --- */}

        {/* Footer (Tidak berubah, tinggi otomatis) */}
        <div className="p-4 border-t border-white/10 shrink-0"> {/* Tambah flex-shrink-0 */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-100 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
