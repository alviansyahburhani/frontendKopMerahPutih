"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogOut,
  X,
  Landmark,
  HandCoins,
  MessageSquare,
  FileText,
  User,
} from "lucide-react";
import clsx from "clsx";
import { authService } from "@/services/auth.service";
import { JwtPayload } from "@/types/api.types"; // <-- 1. Import JwtPayload

// Definisikan link navigasi
const navLinks = [
  { href: "/dashboard/anggota", label: "Dashboard", icon: Home },
  { href: "/dashboard/anggota/simpanan", label: "Simpanan", icon: Landmark },
  { href: "/dashboard/anggota/pinjaman", label: "Pinjaman", icon: HandCoins },
  { href: "/dashboard/anggota/saran", label: "Kirim Saran", icon: MessageSquare },
  { href: "/dashboard/anggota/notulen", label: "Arsip Notulen", icon: FileText },
  { href: "/dashboard/anggota/profile", label: "Profil Saya", icon: User },
];

// 2. Definisikan tipe Props untuk menerima userData
type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userData: JwtPayload | null; // <-- Prop ini yang menyebabkan error
};

export default function AnggotaSidebar({
  isSidebarOpen,
  toggleSidebar,
  userData, // <-- 3. Terima prop userData di sini
}: Props) {
  const pathname = usePathname();

  const handleLogout = () => {
    console.log("Logging out...");
    authService.logout(); // Gunakan service yang sudah benar
  };

  return (
    <>
      {/* Backdrop untuk mobile */}
      <div
        onClick={toggleSidebar}
        className={clsx(
          "fixed inset-0 bg-black/50 z-30 md:hidden",
          isSidebarOpen ? "block" : "hidden"
        )}
      />

      {/* Konten Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-64 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Sidebar */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">Koperasi Digital</h2>
            {/* 4. Tampilkan nama pengguna jika ada */}
            <span className="text-sm text-red-200">
              {userData?.fullName || "Anggota Panel"}
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label="Tutup Menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => isSidebarOpen && toggleSidebar()} // Tutup sidebar di mobile saat link diklik
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-2 transition-all",
                  {
                    "bg-white text-brand-red-700 font-semibold": isActive,
                    "text-white/80 hover:bg-white/20": !isActive,
                  }
                )}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-2 text-white/80 hover:bg-white/20"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}