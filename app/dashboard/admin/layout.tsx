// frontend/app/dashboard/admin/layout.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/token";
import { JwtPayload, ApiErrorResponse } from "@/types/api.types";
import { Role } from "@/types/enums";
import { useAuthSync } from '@/lib/hooks/useAuthSync';
import { adminService } from '@/services/admin.service';
import type { BoardMember } from '@/services/admin.service';
import { toast } from 'react-toastify';
// Impor ikon loading jika perlu, atau gunakan teks/spinner sederhana
// import { Loader2 } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<JwtPayload | null>(null);
  const [activeJabatans, setActiveJabatans] = useState<string[]>([]);
  // --- State Loading Baru ---
  const [isDataLoading, setIsDataLoading] = useState(true); // Mulai dengan true
  // -------------------------
  const router = useRouter();
  const pathname = usePathname();

  useAuthSync();

  useEffect(() => {
    // Set loading true di awal fetch
    setIsDataLoading(true);
    setActiveJabatans([]); // Reset jabatans
    setUserData(null); // Reset user data

    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      // Tidak perlu set loading false karena sudah redirect
      return;
    }

    const fetchProfileAndPositions = async () => {
      let profile: JwtPayload | null = null;
      let jabatans: string[] = [];
      let shouldLogout = false;

      try {
        profile = await authService.getProfile();
        if (profile.role !== Role.Pengurus && profile.role !== Role.Pengawas) {
           console.warn(`Akses ditolak: Pengguna ${profile.email} (${profile.role}) mencoba mengakses dashboard admin.`);
           shouldLogout = true; // Tandai untuk logout
        } else {
            // Hanya fetch jabatan jika Pengurus
            if (profile.role === Role.Pengurus) {
                try {
                    const positions: BoardMember[] = await adminService.getMyActiveBoardPositions();
                    jabatans = positions.map(p => p.jabatan);
                    // Set cookie hint (opsional, tergantung middleware)
                    const isCurrentlyBendahara = jabatans.includes('Bendahara');
                    document.cookie = `isBendahara=${isCurrentlyBendahara ? '1' : '0'}; Path=/; SameSite=Lax; Max-Age=1800`;
                } catch (e) {
                    console.warn('Gagal memuat jabatan aktif pengurus.', e);
                    // Tetap lanjutkan meskipun jabatan gagal, mungkin tampilkan menu default
                    jabatans = [];
                    document.cookie = `isBendahara=0; Path=/; SameSite=Lax; Max-Age=600`;
                }
            }
             // Set cookie role (setelah role diverifikasi)
             document.cookie = `role=${profile.role}; Path=/; SameSite=Lax; Max-Age=1800`;
        }

      } catch (err) {
        const error = err as ApiErrorResponse;
        console.error("Gagal memuat profil admin:", error.message);
        shouldLogout = true; // Logout jika gagal fetch profil
      } finally {
        if (shouldLogout) {
            authService.logout();
            // Loading tidak perlu di-set false karena sudah redirect/logout
        } else if (profile) {
            // --- Set state HANYA setelah semua data (profile & jabatans) siap ---
            setUserData(profile);
            setActiveJabatans(jabatans);
            setIsDataLoading(false); // Selesai loading HANYA jika berhasil
            // -----------------------------------------------------------------
        } else {
             // Kasus aneh, profil null tapi tidak logout? Mungkin redirect?
             setIsDataLoading(false); // Atau redirect ke login
             router.push("/auth/login");
        }
      }
    };

    fetchProfileAndPositions().catch(console.error);

  }, [router, pathname]); // Tambahkan pathname agar re-fetch jika URL berubah signifikan (opsional)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Tampilkan notifikasi jika diarahkan dengan ?denied=1
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('denied') === '1') {
      toast.error('Akses ditolak');
      url.searchParams.delete('denied');
      window.history.replaceState({}, '', url.toString());
    }
  }, [pathname]);

  // --- Tampilkan Loading Indicator Selama Data Dimuat ---
  if (isDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-600">
        {/* <Loader2 className="animate-spin h-8 w-8 mr-3" /> */}
        Memuat data pengguna...
      </div>
    );
  }
  // -------------------------------------------------------

  // Jika sudah tidak loading dan ada userData (validasi role sudah di useEffect)
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        userData={userData} // userData pasti sudah ada di sini
        activeJabatans={activeJabatans} // activeJabatans juga sudah siap
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          toggleSidebar={toggleSidebar}
          userData={userData}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

