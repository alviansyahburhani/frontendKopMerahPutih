// frontend/services/superAdminAuth.service.ts
import { 
  adminApi, 
  parseApiError 
} from '@/lib/adminApi'; // Gunakan adminApi
import { adminTokenStorage } from '@/lib/adminToken'; // Gunakan adminTokenStorage
import { 
  LoginResponse, 
  SuperAdminUser, // <-- Tipe ini sekarang sudah ada
} from '@/types/api.types';

// Tipe DTO dari backend Anda
//
interface SuperAdminLoginDto {
  email: string;
  password?: string; // DTO backend hanya perlu email & password
}

// Wrapper handleRequest
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw parseApiError(error); // Gunakan parseApiError dari adminApi
  }
}

export const superAdminAuthService = {
  /**
   * Login sebagai Super Admin.
   * Endpoint: POST /admin/auth/login
   */
  login: async (credentials: SuperAdminLoginDto): Promise<LoginResponse> => {
    try {
      const { data } = await adminApi.post<LoginResponse>(
        '/admin/auth/login', 
        credentials
      );
      // Simpan token setelah login berhasil
      adminTokenStorage.setTokens(data);
      return data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Logout Super Admin.
   */
  logout: (): void => {
    adminTokenStorage.clearTokens();
    // Hapus juga cookie hint jika ada
    try {
      document.cookie = 'role=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie = 'isBendahara=; Max-Age=0; Path=/; SameSite=Lax';
    } catch {}
    
    // Redirect bisa dilakukan di sini atau di komponen UI
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'; // Arahkan ke login utama
    }
  },

  /**
   * Mengambil profil Super Admin yang sedang login.
   * Endpoint: GET /admin/auth/profile
   */
  getProfile: (): Promise<SuperAdminUser> => {
    // Tipe SuperAdminUser sekarang sudah benar
    return handleRequest(adminApi.get<SuperAdminUser>('/admin/auth/profile')); 
  },
};