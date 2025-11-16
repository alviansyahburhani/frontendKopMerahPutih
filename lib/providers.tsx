"use client"; // Wajib, karena ini adalah komponen client-side

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Buat komponen provider
export default function Providers({ children }: { children: React.ReactNode }) {
  // Gunakan useState agar client tidak dibuat ulang setiap render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 menit cache
            refetchOnWindowFocus: false, // Opsional: nonaktifkan refetch saat fokus
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Pindahkan Toaster Anda ke sini agar rapi */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-sm",
          duration: 4000,
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
        }}
      />
      {children}
    </QueryClientProvider>
  );
}