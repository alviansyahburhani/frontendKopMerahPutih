// app/(superadmin)/superadmin/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { SuperAdminUser } from '@/types/api.types';
import { adminTokenStorage } from '@/lib/adminToken'; 
// <-- UBAH DI SINI: Impor JwtPayload juga
import { jwtDecode, JwtPayload } from 'jwt-decode'; 

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = adminTokenStorage.getAccessToken();

    if (!token) {
      router.replace('/auth/superadmin/login');
      return; 
    }

    try {
      // <-- UBAH DI SINI: Gabungkan tipe SuperAdminUser & JwtPayload
      const decoded = jwtDecode<SuperAdminUser & JwtPayload>(token);
      
      // <-- UBAH DI SINI: Cek 'decoded.exp'
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.error('Super Admin token expired.');
        adminTokenStorage.clearTokens();
        router.replace('/auth/superadmin/login');
        return;
      }
      
      // <-- UBAH DI SINI: Set state dengan data yang sudah di-decode
      setUser(decoded);
      setIsLoading(false);

    } catch (error) {
      console.error('Failed to decode Super Admin token:', error);
      adminTokenStorage.clearTokens();
      router.replace('/auth/superadmin/login');
    }
    
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memverifikasi sesi...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SuperAdminSidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminHeader user={user} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}