// frontend/app/dashboard/admin/layout.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/token";
// --- PERBAIKI IMPORT DI SINI ---
import { JwtPayload, ApiErrorResponse } from "@/types/api.types"; // Hapus Role dari sini
import { Role } from "@/types/enums"; // <-- Import Role dari enums.ts
// --- SELESAI PERBAIKAN IMPORT ---
import { useAuthSync } from '@/lib/hooks/useAuthSync';
import { adminService } from '@/services/admin.service';
import type { BoardMember } from '@/services/admin.service';
import { toast } from 'react-toastify';

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<JwtPayload | null>(null);
  const [isBendahara, setIsBendahara] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  

  useAuthSync();

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        // --- ERROR 'Cannot find name Role' AKAN HILANG SETELAH IMPORT DIPERBAIKI ---
        if (profile.role !== Role.Pengurus && profile.role !== Role.Pengawas) {
           console.warn(`Akses ditolak: Pengguna ${profile.email} (${profile.role}) mencoba mengakses dashboard admin.`);
           authService.logout();
           return;
        }
        setUserData(profile);

        // Jika Pengurus, cek jabatan aktifnya
        if (profile.role === Role.Pengurus) {
          try {
            const positions: BoardMember[] = await adminService.getMyActiveBoardPositions();
            const bendahara = positions?.some((p) => p.jabatan === 'Bendahara');
            setIsBendahara(!!bendahara);
            // Set cookie hints untuk middleware
            document.cookie = `role=${profile.role}; Path=/; SameSite=Lax; Max-Age=1800`;
            document.cookie = `isBendahara=${bendahara ? '1' : '0'}; Path=/; SameSite=Lax; Max-Age=1800`;
          } catch (e) {
            console.warn('Gagal memuat jabatan aktif pengurus. Mengasumsikan bukan Bendahara.', e);
            setIsBendahara(false);
            document.cookie = `role=${profile.role}; Path=/; SameSite=Lax; Max-Age=1800`;
            document.cookie = `isBendahara=0; Path=/; SameSite=Lax; Max-Age=600`;
          }
        } else {
          setIsBendahara(false);
          // Pengawas atau lainnya
          document.cookie = `role=${profile.role}; Path=/; SameSite=Lax; Max-Age=1800`;
          document.cookie = `isBendahara=0; Path=/; SameSite=Lax; Max-Age=1800`;
        }
      } catch (err) {
        const error = err as ApiErrorResponse;
        console.error("Gagal memuat profil admin:", error.message);
        authService.logout();
      } finally {
        // no-op
      }
    };

    fetchProfile().catch(console.error);

  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Route guard berbasis jabatan Bendahara
  useEffect(() => {
    if (!userData) return;
    const isAdminRoot = pathname === '/dashboard/admin';
    const isSimpanan = pathname?.startsWith('/dashboard/admin/simpanan-anggota');
    const isPinjaman = pathname?.startsWith('/dashboard/admin/pinjaman-anggota');

    if (userData.role === Role.Pengurus) {
      if (isBendahara) {
        // Bendahara: hanya boleh dashboard, simpanan, pinjaman
        const allowed = isAdminRoot || isSimpanan || isPinjaman;
        if (!allowed) {
          router.replace('/dashboard/admin');
        }
      } else {
        // Pengurus lain: tidak boleh membuka simpanan/pinjaman
        if (isSimpanan || isPinjaman) {
          router.replace('/dashboard/admin');
        }
      }
    } else if (userData.role === Role.Pengawas) {
      // Pengawas: tidak boleh simpanan/pinjaman (sesuai permintaan fokus Bendahara)
      if (isSimpanan || isPinjaman) {
        router.replace('/dashboard/admin');
      }
    }
  }, [userData, isBendahara, pathname, router]);

  // Tampilkan notifikasi jika diarahkan dengan ?denied=1 lalu bersihkan query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('denied') === '1') {
      toast.error('Akses ditolak');
      url.searchParams.delete('denied');
      window.history.replaceState({}, '', url.toString());
    }
  }, [pathname]);

  // --- ERROR 'Cannot find name Role' AKAN HILANG SETELAH IMPORT DIPERBAIKI ---
   if (!userData || (userData.role !== Role.Pengurus && userData.role !== Role.Pengawas)) {
      return null;
   }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        userData={userData} // <-- Kirim prop userData
        isBendahara={isBendahara}
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          toggleSidebar={toggleSidebar}
          userData={userData} // <-- Kirim prop userData
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
