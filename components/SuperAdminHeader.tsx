// Lokasi: frontend/components/SuperAdminHeader.tsx
"use client";

import { Menu, ShieldCheck } from "lucide-react";

type Props = {
  toggleSidebar: () => void;
};

export default function SuperAdminHeader({ toggleSidebar }: Props) {
  return (
    // Header ini hanya muncul di mobile (md:hidden)
    <header className="md:hidden sticky top-0 z-30 bg-white shadow-md border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
           <ShieldCheck size={20} className="text-blue-600"/> Super Admin
        </p>
        <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-100" aria-label="Buka Menu">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}