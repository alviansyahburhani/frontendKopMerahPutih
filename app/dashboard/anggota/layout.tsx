// // frontend/app/dashboard/anggota/layout.tsx
// "use client";

// import { useState, ReactNode, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import AnggotaSidebar from "@/components/AnggotaSidebar";
// import AnggotaHeader from "@/components/AnggotaHeader";
// import { getAccessToken, apiGetProfile, apiLogout } from "@/lib/api"; // <-- Import apiGetProfile dan apiLogout

// // Tipe sederhana untuk data profil (sesuaikan jika perlu)
// interface UserProfile {
//   userId: string;
//   email: string;
//   role: string;
//   // Tambahkan 'fullName' jika backend mengirimkannya (saat ini belum ada di JwtPayloadDto)
//   fullName?: string; // Opsional dulu
// }

// export default function AnggotaDashboardLayout({ children }: { children: ReactNode }) {
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // <-- State untuk profil

//   useEffect(() => {
//     const verifySession = async () => {
//       const token = getAccessToken();
//       if (!token) {
//         console.log("No token found, redirecting to login...");
//         router.replace('/auth/login');
//         return; // Hentikan eksekusi jika tidak ada token
//       }

//       // Jika ada token, coba ambil profil dari backend
//       try {
//         console.log("Token found, fetching profile...");
//         const profile = await apiGetProfile(); // <-- Panggil API profil
//         console.log("Profile fetched:", profile);
//         setUserProfile(profile); // <-- Simpan profil di state
//         setIsLoading(false); // Selesai loading
//       } catch (error: any) {
//         console.error("Failed to fetch profile or token invalid:", error);
//         // Jika gagal (token tidak valid/kedaluwarsa), hapus token dan redirect
//         apiLogout(); // Hapus token dari localStorage
//         router.replace('/auth/login?sessionExpired=true'); // Redirect ke login dengan param (opsional)
//       }
//     };

//     verifySession(); // Panggil fungsi verifikasi
//   }, [router]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!isSidebarOpen);
//   };

//   // Tampilkan loading indicator selama pengecekan token/profil
//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-100">
//         <p>Memverifikasi sesi Anda...</p>
//       </div>
//     );
//   }

//   // Jika loading selesai dan profil ada, tampilkan layout dashboard
//   return (
//     <div className="flex h-screen bg-slate-50 overflow-hidden">
//       {/* Anda bisa pass userProfile ke Sidebar jika diperlukan */}
//       <AnggotaSidebar
//         isSidebarOpen={isSidebarOpen}
//         toggleSidebar={toggleSidebar}
//         // userData={userProfile} // Contoh passing data
//       />

//       <div className="flex-1 flex flex-col">
//         {/* Anda bisa pass userProfile ke Header jika diperlukan */}
//         <AnggotaHeader
//           toggleSidebar={toggleSidebar}
//           // userData={userProfile} // Contoh passing data
//         />
//         <main className="p-6 md:p-8 overflow-y-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }


"use client"; // Diperlukan karena menggunakan state untuk sidebar

import { useState, ReactNode } from "react";
import AnggotaSidebar from "@/components/AnggotaSidebar";
import AnggotaHeader from "@/components/AnggotaHeader";

export default function AnggotaDashboardLayout({ children }: { children: ReactNode }) {
  // State untuk mengontrol visibilitas sidebar di mode mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    // PERUBAHAN 1: Tambahkan `h-screen` dan `overflow-hidden` pada div terluar
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AnggotaSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <AnggotaHeader toggleSidebar={toggleSidebar} />
        {/* PERUBAHAN 2: Buat area <main> bisa di-scroll secara independen */}
        <main className="p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}  