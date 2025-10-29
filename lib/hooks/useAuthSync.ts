// frontend/lib/hooks/useAuthSync.ts
"use client";

import { useEffect } from 'react';
import { authService } from '@/services/auth.service';


/**
 * Hook ini menyinkronkan status autentikasi di semua tab.
 */
export function useAuthSync() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === 'accessToken' && event.newValue === null) {
        console.log('Sinkronisasi Logout: Token dihapus di tab lain.');
        

        if (window.location.pathname !== '/auth/login') {
          authService.logout(); 
        }
      }
      

      if (event.key === 'accessToken' && event.oldValue === null && event.newValue !== null) {
         console.log('Sinkronisasi Login: Login terdeteksi di tab lain.');
         window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
}