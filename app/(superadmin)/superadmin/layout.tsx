// Lokasi: frontend/app/(superadmin)/superadmin/layout.tsx
"use client";

import { useState, ReactNode } from "react";
import SuperAdminSidebar from "@/components/SuperAdminSidebar"; // <-- Komponen baru
import SuperAdminHeader from "@/components/SuperAdminHeader"; // <-- Komponen baru

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden"> {/* Latar belakang sedikit berbeda */}
      <SuperAdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        <SuperAdminHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}