// Lokasi: frontend/components/SuperAdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building, Settings, LogOut, X, ShieldCheck,
  Newspaper, // Ikon baru untuk Berita
  Image as ImageIcon // Ikon baru untuk Galeri (gunakan alias jika nama konflik)
} from "lucide-react";
import clsx from "clsx";

// Definisikan link navigasi untuk Super Admin
const navLinks = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/persetujuan-koperasi", label: "Persetujuan Koperasi", icon: Building },
  { href: "/superadmin/tenants", label: "Manajemen Koperasi", icon: Building },
  { href: "/superadmin/berita", label: "Manajemen Berita", icon: Newspaper },
  { href: "/superadmin/galeri", label: "Manajemen Galeri", icon: ImageIcon },
  { href: "/superadmin/settings", label: "Pengaturan Platform", icon: Settings },
];

type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function SuperAdminSidebar({ isSidebarOpen, toggleSidebar }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    console.log("Super Admin logout...");
    router.push('/auth/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={toggleSidebar}
        className={clsx("fixed inset-0 bg-black/50 z-30 md:hidden", isSidebarOpen ? "block" : "hidden")}
      />

      <aside
        className={clsx(
          // ===== PERUBAHAN WARNA DI SINI =====
          "fixed inset-y-0 left-0 w-64 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0", // <-- Ubah bg-gray-800 ke bg-brand-red-700
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Sidebar */}
        <div className="p-5 flex items-center justify-between border-b border-white/10"> {/* <-- Ubah border-gray-700 ke border-white/10 */}
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck size={24} /> Panel Super Admin
            </h2>
            <span className="text-sm text-red-200">sistemkoperasi.id</span> {/* <-- Ubah text-gray-400 ke text-red-200 */}
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-1 rounded hover:bg-white/20" aria-label="Tutup Menu"> {/* <-- Ubah hover:bg-gray-700 */}
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/superadmin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => isSidebarOpen && toggleSidebar()}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-2 transition-all font-medium",
                  {
                    // Style aktif: Latar putih, teks merah (konsisten dgn admin biasa)
                    "bg-white text-brand-red-700 shadow": isActive,
                    // Style tidak aktif: Teks putih pudar, hover latar lebih terang
                    "text-red-100 hover:bg-white/20 hover:text-white": !isActive, // <-- Ubah text-gray-300 dan hover:bg-gray-700
                  }
                )}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar (Logout) */}
        <div className="p-4 border-t border-white/10"> {/* <-- Ubah border-gray-700 */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-2 text-red-100 hover:bg-white/20 hover:text-white" // <-- Ubah text-gray-300 dan hover:bg-gray-700
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}