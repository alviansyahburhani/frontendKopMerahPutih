"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, UserPlus, Users, BookUser, Shield, Briefcase, Landmark, HandCoins,
  Archive, BookOpen, FileText, MessageSquare, Award, Building, ClipboardList, Mail,
  History, Settings, X, LogOut, BookMarked, Globe, LucideIcon,
  Image as ImageIcon // Alias untuk ikon Galeri
} from "lucide-react";
import clsx from "clsx";
import { authService } from "@/services/auth.service";
import { JwtPayload } from "@/types/api.types";
import { Role } from "@/types/enums";

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

// Tipe Props baru
type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userData: JwtPayload | null;
  activeJabatans: string[];
};

/* =========================
   Data menu (Definisi Lengkap)
========================= */
const dashboardItem: NavItem = { href: "/dashboard/admin", label: "Dashboard", icon: LayoutGrid };

<<<<<<< HEAD
// Definisikan SEMUA kemungkinan menu di sini
=======
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
const bukuKoperasiGroups: NavGroup[] = [
  {
    title: "Manajemen Utama",
    links: [
      { href: "/dashboard/admin/persetujuan-anggota", label: "Persetujuan Anggota", icon: UserPlus },
      { href: "/dashboard/admin/daftar-anggota", label: "Daftar Anggota", icon: Users },
      { href: "/dashboard/admin/daftar-pengurus", label: "Daftar Pengurus", icon: BookUser },
      { href: "/dashboard/admin/daftar-pengawas", label: "Daftar Pengawas", icon: Shield },
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
      { href: "/dashboard/admin/saran-pengawas", label: "Saran Pengawas", icon: Award },
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
      { href: "/dashboard/admin/website/berita", label: "Berita & Artikel", icon: FileText },
      { href: "/dashboard/admin/website/katalog", label: "Katalog Produk", icon: Landmark },
      { href: "/dashboard/admin/website/galeri", label: "Galeri Foto", icon: ImageIcon }, // Menggunakan alias ImageIcon
      { href: "/dashboard/admin/website/kontak", label: "Info Kontak", icon: Mail },
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
<<<<<<< HEAD
   Mapping Hak Akses Jabatan (DIPERBARUI SESUAI PERMINTAAN)
========================= */
const JABATAN_MENU_MAP: Record<string, string[]> = {
  'ketua': [
=======
   Mapping Hak Akses Jabatan
========================= */
const JABATAN_MENU_MAP: Record<string, string[]> = {
  'ketua': [ // <-- HAK AKSES KETUA DIPERBARUI
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
    // Manajemen Utama
    '/dashboard/admin/persetujuan-anggota', '/dashboard/admin/daftar-anggota',
    '/dashboard/admin/daftar-pengurus', '/dashboard/admin/daftar-pengawas',
    '/dashboard/admin/daftar-karyawan',
<<<<<<< HEAD
    // Administrasi (Menghapus inventaris, notulen anggota/pengawas, catatan kejadian)
    '/dashboard/admin/buku-tamu',
    '/dashboard/admin/notulen-rapat-pengurus',
    '/dashboard/admin/saran-anggota', '/dashboard/admin/saran-pengawas',
    '/dashboard/admin/anjuran-pejabat', '/dashboard/admin/agenda-ekspedisi',
    // Website (Menghapus katalog)
=======
    // Administrasi (Daftar Inventaris, Notulen Anggota/Pengawas, Catatan Kejadian DIHAPUS)
    '/dashboard/admin/buku-tamu',
    '/dashboard/admin/notulen-rapat-pengurus', // Hanya notulen pengurus
    '/dashboard/admin/saran-anggota', '/dashboard/admin/saran-pengawas',
    '/dashboard/admin/anjuran-pejabat', '/dashboard/admin/agenda-ekspedisi',
    // Website (Katalog Produk DIHAPUS)
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
    '/dashboard/admin/website/berita',
    '/dashboard/admin/website/galeri', '/dashboard/admin/website/kontak',
    // Sistem (Semua)
    '/dashboard/admin/sistem/log-audit', '/dashboard/admin/sistem/pengaturan',
  ],
<<<<<<< HEAD
  'sekretaris': [ // (Sudah sesuai permintaan sebelumnya)
=======
  'sekretaris': [ // <-- HAK AKSES SEKRETARIS DIPERBARUI (sama seperti sebelumnya karena sudah sesuai)
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
    // Manajemen Utama
    '/dashboard/admin/daftar-anggota', '/dashboard/admin/daftar-karyawan',
    // Administrasi
    '/dashboard/admin/buku-tamu', '/dashboard/admin/notulen-rapat-anggota',
    '/dashboard/admin/notulen-rapat-pengurus', '/dashboard/admin/notulen-rapat-pengawas',
    '/dashboard/admin/saran-anggota', '/dashboard/admin/saran-pengawas',
    '/dashboard/admin/anjuran-pejabat',
    '/dashboard/admin/catatan-kejadian',
    '/dashboard/admin/agenda-ekspedisi',
    // Website
    '/dashboard/admin/website/berita',
    '/dashboard/admin/website/galeri',
    '/dashboard/admin/website/kontak',
    // Sistem
    '/dashboard/admin/sistem/log-audit',
    '/dashboard/admin/sistem/pengaturan',
  ],
<<<<<<< HEAD
  'bendahara': [ // (Tidak berubah)
=======
  'bendahara': [ // <-- Hak akses Bendahara (tidak berubah)
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
    // Keuangan
    '/dashboard/admin/simpanan-anggota', '/dashboard/admin/pinjaman-anggota',
    // Administrasi
    '/dashboard/admin/daftar-inventaris',
    // Website
     '/dashboard/admin/website/katalog',
    // Sistem
    '/dashboard/admin/sistem/pengaturan',
  ],
};

// Menu default untuk Pengurus tanpa jabatan spesifik
const DEFAULT_PENGURUS_MENUS: string[] = [
  '/dashboard/admin/daftar-anggota',
  '/dashboard/admin/sistem/pengaturan',
];

// Menu untuk Pengawas
const PENGAWAS_MENUS: string[] = [
   '/dashboard/admin/daftar-anggota',
   '/dashboard/admin/daftar-pengurus',
   '/dashboard/admin/saran-pengawas',
   '/dashboard/admin/notulen-rapat-pengawas',
   '/dashboard/admin/sistem/pengaturan',
];

<<<<<<< HEAD

=======
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
/* =========================
   Komponen NavLink (memoized)
========================= */
const NavLink = memo(function NavLink({
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
<<<<<<< HEAD
NavLink.displayName = "NavLink"; // Tambahkan display name
=======
NavLink.displayName = "NavLink";
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe

/* =========================
   Sidebar
========================= */
export default function AdminSidebar({
  isSidebarOpen,
  toggleSidebar,
  userData,
<<<<<<< HEAD
  activeJabatans = [], // Default array kosong
=======
  activeJabatans = [],
>>>>>>> b12d78b4a137ecc94bfe9d45fba3995fb5a58bfe
}: Props) {
  const pathname = usePathname();

  // Tentukan Menu yang Boleh Diakses (Logika tidak berubah)
  const allowedMenuHrefs = useMemo(() => {
    const allowed = new Set<string>();

    if (userData?.role === Role.Pengurus || userData?.role === Role.Pengawas) {
        allowed.add('/dashboard/admin');
    }

    if (userData?.role === Role.Pengurus) {
        if (activeJabatans.length > 0) {
            activeJabatans.forEach(jabatan => {
                const normalizedJabatan = jabatan.toLowerCase();
                const menusForJabatan = JABATAN_MENU_MAP[normalizedJabatan] || [];
                menusForJabatan.forEach(href => allowed.add(href));
            });
        } else {
            DEFAULT_PENGURUS_MENUS.forEach(href => allowed.add(href));
        }
    } else if (userData?.role === Role.Pengawas) {
        PENGAWAS_MENUS.forEach(href => allowed.add(href));
    }

    return allowed;
  }, [activeJabatans, userData?.role]);


  // Fungsi Filter Grup (Logika tidak berubah)
  const filterGroups = (groups: NavGroup[]): NavGroup[] => {
      return groups
          .map(group => ({
              ...group,
              links: group.links.filter(link => allowedMenuHrefs.has(link.href))
          }))
          .filter(group => group.links.length > 0);
  };

  const accessibleBukuGroups = filterGroups(bukuKoperasiGroups);
  const accessibleAplikasiGroups = filterGroups(aplikasiGroups);

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

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-72 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold">Panel {userData?.role || 'Admin'}</h2>
            <span className="text-sm text-red-200">
              {userData?.fullName || 'Koperasi Digital'}
            </span>
             {userData?.role === Role.Pengurus && activeJabatans.length > 0 && (
                <span className="block text-xs text-yellow-300 mt-1">
                    ({activeJabatans.join(', ')})
                </span>
             )}
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded hover:bg-white/10"
            aria-label="Tutup menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">

           {/* Dashboard Utama */}
           {allowedMenuHrefs.has('/dashboard/admin') && (
                <div className="mb-4">
                    <NavLink
                        item={dashboardItem}
                        isActive={pathname === dashboardItem.href}
                        onClick={handleItemClick}
                    />
                </div>
            )}

          {/* Buku Administrasi */}
          {accessibleBukuGroups.length > 0 && (
            <div className="space-y-4">
              <div className="px-3 flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-red-200" />
                <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">
                  Buku Administrasi
                </h3>
              </div>
              {accessibleBukuGroups.map((group) => (
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

          {/* Pemisah */}
          {(accessibleBukuGroups.length > 0 && accessibleAplikasiGroups.length > 0) && (
            <hr className="my-6 border-white/10" />
          )}

          {/* Aplikasi & Sistem */}
           {accessibleAplikasiGroups.length > 0 && (
             <div className="space-y-4">
              <div className="px-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-200" />
                <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">
                  Aplikasi & Sistem
                </h3>
              </div>
              {accessibleAplikasiGroups.map((group) => (
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
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
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

