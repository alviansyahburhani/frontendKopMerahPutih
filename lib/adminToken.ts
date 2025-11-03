// frontend/lib/adminToken.ts
// Ini adalah salinan dari lib/token.ts, tapi dengan key yang berbeda

import { LoginResponse } from '@/types/api.types';

// Gunakan key yang berbeda untuk super admin
const ACCESS_TOKEN_KEY = 'superAdminAccessToken';
const REFRESH_TOKEN_KEY = 'superAdminRefreshToken';

export const adminTokenStorage = {
  /**
   * Menyimpan kedua token (access dan refresh) ke localStorage.
   */
  setTokens(tokens: LoginResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  /**
   * Mengambil access token dari localStorage.
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Mengambil refresh token dari localStorage.
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Menghapus semua token dari localStorage.
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};