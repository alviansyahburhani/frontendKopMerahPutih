// frontend/services/auth.service.ts
import { api, parseApiError } from '@/lib/api';
import { tokenStorage } from '@/lib/token';
import {
  LoginDto,
  LoginResponse,
  JwtPayload,
  RegisterTenantDto,
  RegisterTenantResponse,
  CreateMemberRegistrationDto,
  MemberRegistrationResponse,
  UploadResponse,
} from '@/types/api.types';

/**
 * Wrapper untuk menangani request dan mengembalikan data atau melempar error yang bersih.
 */
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    // Melempar error yang sudah diparsing agar bisa ditangkap
    // dengan mudah di komponen (misal: di react-hook-form atau state error)
    throw parseApiError(error);
  }
}

export const authService = {
  /**
   * Login pengguna dan simpan token.
   */
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const data = await handleRequest(
      api.post<LoginResponse>('/auth/login', credentials),
    );
    
    // Simpan token setelah login sukses
    tokenStorage.setTokens(data);
    return data;
  },

  /**
   * Mengambil profil pengguna yang sedang login.
   */
  getProfile: (): Promise<JwtPayload> => {
    return handleRequest(api.get<JwtPayload>('/auth/profile'));
  },

  /**
   * Logout pengguna (hanya di sisi client).
   */
  logout: (): void => {
    tokenStorage.clearTokens();
    // Redirect bisa dilakukan di sini atau di komponen
    // Bersihkan hint cookies yang digunakan middleware
    try {
      document.cookie = 'role=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie = 'isBendahara=; Max-Age=0; Path=/; SameSite=Lax';
    } catch {}
    window.location.href = '/auth/login';
  },
};

export const publicService = {
  /**
   * Mengunggah satu file.
   * Menggunakan endpoint yang sesuai dari backend.
   */
  uploadFile: (file: File, endpoint: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Gunakan 'uploadApi' atau 'api' (interceptor 'api' sudah handle FormData)
    return handleRequest(api.post<UploadResponse>(endpoint, formData));
  },

  /**
   * Mendaftarkan tenant baru.
   */
  registerTenant: (dto: RegisterTenantDto): Promise<RegisterTenantResponse> => {
    return handleRequest(
      api.post<RegisterTenantResponse>('/public/register', dto),
    );
  },

  /**
   * Mendaftarkan anggota baru.
   */
  registerMember: (
    dto: CreateMemberRegistrationDto,
  ): Promise<MemberRegistrationResponse> => {
    return handleRequest(
      api.post<MemberRegistrationResponse>('/member-registrations', dto),
    );
  },
};

