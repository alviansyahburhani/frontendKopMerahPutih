// components/SuperAdminHeader.tsx
'use client';

import React from 'react';
import { SuperAdminUser } from '@/types/api.types';

// Gabungkan props 'user' dan 'toggleSidebar'
interface SuperAdminHeaderProps {
  user: SuperAdminUser;
  toggleSidebar: () => void; // <-- Prop yang Anda maksud
}

export default function SuperAdminHeader({ 
  user, 
  toggleSidebar 
}: SuperAdminHeaderProps) {
  

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-indigo-600">
      <div className="flex items-center">
        {/* * Ini tombol toggle Anda, sekarang terhubung ke 'toggleSidebar' 
          * dari layout. (Saya ambil dari kode asli Anda)
        */}
        <button 
          onClick={toggleSidebar} 
          className="text-gray-500 focus:outline-none lg:hidden"
        >
          <svg 
            className="w-6 h-6" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M4 6H20M4 12H20M4 18H11" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </button>
        {/* Hapus h1 'Super Admin Dashboard' dari sini jika 
            sudah ada di sidebar atau page.tsx */}
      </div>

      <div className="flex items-center">
        <div className="relative">
          {/* Tampilkan nama user */}
          <span className="mr-4 font-medium text-gray-700">{user.fullName}</span>

        </div>
      </div>
    </header>
  );
}