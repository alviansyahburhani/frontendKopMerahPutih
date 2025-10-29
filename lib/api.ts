// frontend/lib/api.ts
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { tokenStorage } from './token';
import { ApiErrorResponse, LoginResponse } from '@/types/api.types';

// Ambil Base URL dari environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    'FATAL ERROR: NEXT_PUBLIC_API_BASE_URL is not defined in .env.local',
  );
}

/**
 * Instance axios utama yang digunakan untuk semua request API.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 1. REQUEST INTERCEPTOR
 * Secara otomatis melampirkan Access Token ke header Authorization
 * untuk setiap request, kecuali untuk endpoint publik.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Daftar endpoint yang tidak memerlukan token
    const publicEndpoints = [
      '/auth/login',
      '/auth/refresh',
      '/public/register',
      '/member-registrations',
    ];
    
    // Khusus untuk endpoint upload, biarkan header 'Content-Type' di-manage
    // oleh axios untuk multipart/form-data
    if (config.data instanceof FormData) {
       // Hapus header Content-Type agar Axios dapat mengaturnya
       // (termasuk boundary) secara otomatis
       delete config.headers['Content-Type'];
    }

    // Cek apakah URL request termasuk dalam public endpoints
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.startsWith(endpoint),
    );
    // Endpoint upload juga kita anggap public
    const isUploadEndpoint = config.url?.startsWith('/uploads');

    if (isPublicEndpoint || isUploadEndpoint) {
      console.log(`REQ [PUBLIC]: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    }

    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`REQ [AUTH]: ${config.method?.toUpperCase()} ${config.url} without token.`);
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Kembalikan promise yang di-reject jika ada error di request setup
    return Promise.reject(error);
  },
);

// Flag untuk mencegah loop refresh token
let isRefreshing = false;

// Tipe untuk antrian request yang gagal
type FailedQueuePromise = {
  resolve: (response: AxiosResponse) => void;
  reject: (error: AxiosError<ApiErrorResponse>) => void;
  config: InternalAxiosRequestConfig; // Simpan config untuk retry
};
let failedQueue: FailedQueuePromise[] = [];

/**
 * Memproses antrian request yang gagal setelah token berhasil di-refresh.
 * Fungsi ini akan me-retry setiap request dalam antrian dengan token baru.
 */
const processQueue = (
  error: AxiosError<ApiErrorResponse> | null,
  token: string | null = null,
): void => {
  failedQueue.forEach(prom => {
    if (error) {
      // Jika refresh token gagal, tolak semua promise di antrian
      prom.reject(error);
    } else if (token) {
      // Jika refresh token berhasil, perbarui header & ulangi request
      prom.config.headers.Authorization = `Bearer ${token}`;
      api(prom.config)
        .then(prom.resolve)
        .catch(prom.reject);
    }
  });
  
  failedQueue = [];
};

/**
 * 2. RESPONSE INTERCEPTOR
 * Menangani error secara global.
 * Fitur utama: Jika request gagal karena token kedaluwarsa (401),
 * interceptor ini akan otomatis mencoba me-refresh token dan
 * mengulang request yang gagal.
 */
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Jika sukses (status 2xx), langsung kembalikan response
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse> => {
    // Dapatkan konfigurasi request original
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Cek jika ini adalah error 401 dan bukan dari request refresh-token itu sendiri
    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/auth/refresh' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Jika PROSES REFRESH SEDANG BERJALAN,
        // masukkan request yang gagal ini ke dalam antrian.
        // Buat promise baru yang akan di-resolve/reject oleh processQueue.
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject: reject as (error: AxiosError<ApiErrorResponse>) => void,
            config: originalRequest,
          });
        });
      }

      // Tandai request ini sebagai sudah di-retry
      originalRequest._retry = true;
      // Mulai proses refresh token
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        console.error('No refresh token available. Logging out.');
        isRefreshing = false;
        tokenStorage.clearTokens();
        // TODO: Handle redirect to login in UI layer (e.g., AuthContext)
        // window.location.href = '/auth/login'; 
        return Promise.reject(error);
      }

      try {
        console.log('Attempting to refresh token...');
        
        // Panggil endpoint refresh token
        const rs = await axios.post<LoginResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Body kosong
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = rs.data;
        
        // Simpan token baru
        tokenStorage.setTokens({ accessToken, refreshToken: newRefreshToken });
        console.log('Token refreshed successfully.');

        // Perbarui header default instance axios
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Proses semua request yang tertunda di antrian dengan token baru
        processQueue(null, accessToken);

        // Ulangi request *original* yang memicu error 401
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // Kembalikan promise dari retry request
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        tokenStorage.clearTokens();
        
        // Tolak semua request di antrian karena refresh gagal
        processQueue(refreshError as AxiosError<ApiErrorResponse>, null);
        
        // TODO: Handle redirect to login in UI layer
        // window.location.href = '/auth/login';
        
        // Tolak promise utama dengan error dari refresh
        return Promise.reject(refreshError as AxiosError<ApiErrorResponse>);
      } finally {
        isRefreshing = false;
      }
    }

    // Untuk semua error lain (selain 401), langsung tolak
    return Promise.reject(error);
  },
);

/**
 * Utility untuk mem-parsing error axios menjadi format yang konsisten.
 * Komponen bisa menggunakan ini untuk mendapatkan pesan error yang bersih.
 */
export const parseApiError = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
    // Ini adalah error API yang terstruktur dari backend NestJS kita
    // (misal: error validasi dari class-validator)
    return error.response.data;
  }

  
  
  // Error jaringan (misal: backend mati) atau error tak terduga lainnya
  return {
    statusCode: 500,
    message: (error instanceof Error) ? error.message : 'Terjadi kesalahan tidak diketahui.',
    error: 'Network Error or Unknown',
  };
};