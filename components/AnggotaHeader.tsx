// frontend/components/AnggotaHeader.tsx
"use client";

import { Menu } from "lucide-react"; // Tambahkan User jika perlu
import { JwtPayload } from "@/types/api.types"; // Import JwtPayload

type Props = {
  toggleSidebar: () => void;
  userData: JwtPayload | null; // <-- Tambahkan userData
};

export default function AnggotaHeader({ toggleSidebar, userData }: Props) { // <-- Terima userData
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Tampilkan Nama Pengguna jika ada */}
        <p className="text-lg font-bold text-brand-red-700">
          {userData?.fullName || 'Menu Anggota'}
        </p>
        <button onClick={toggleSidebar} aria-label="Buka Menu">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}