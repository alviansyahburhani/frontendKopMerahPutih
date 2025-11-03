// frontend/lib/adminApi.ts
// Ini adalah salinan dari lib/api.ts yang disesuaikan untuk Super Admin

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
// STEP 2.1: Impor token storage yang BARU
import { adminTokenStorage } from './adminToken'; 
import { ApiErrorResponse, LoginResponse } from '@/types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    'FATAL ERROR: NEXT_PUBLIC_API_BASE_URL is not defined in .env.local',
  );
}

// Beri nama 'adminApi'
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR (Sama, tapi pakai adminTokenStorage)
adminApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // STEP 2.2: Sesuaikan public endpoint
    const publicEndpoints = [
      '/admin/auth/login', // Ganti ke login admin
      '/admin/auth/refresh', // Ganti ke refresh admin
      // Endpoint lain yang mungkin public untuk admin
    ];
    
    if (config.data instanceof FormData) {
       delete config.headers['Content-Type'];
    }

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.startsWith(endpoint),
    );
    // Endpoint upload (jika ada) mungkin juga public
    const isUploadEndpoint = config.url?.startsWith('/uploads');

    if (isPublicEndpoint || isUploadEndpoint) {
      return config;
    }

    // STEP 2.3: Ambil token dari adminTokenStorage
    const token = adminTokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  },
);

// --- LOGIKA REFRESH TOKEN (BAGIAN PALING PENTING) ---

let isRefreshing = false;
type FailedQueuePromise = {
  resolve: (response: AxiosResponse) => void;
  reject: (error: AxiosError<ApiErrorResponse>) => void;
  config: InternalAxiosRequestConfig;
};
let failedQueue: FailedQueuePromise[] = [];

const processQueue = (
  error: AxiosError<ApiErrorResponse> | null,
  token: string | null = null,
): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.config.headers.Authorization = `Bearer ${token}`;
      adminApi(prom.config) // Panggil ulang pakai 'adminApi'
        .then(prom.resolve)
        .catch(prom.reject);
    }
  });
  
  failedQueue = [];
};

// 2. RESPONSE INTERCEPTOR
adminApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // STEP 2.4: Pastikan kita tidak mencegat error dari endpoint refresh admin
    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/admin/auth/refresh' && // Ganti endpoint
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject: reject as (error: AxiosError<ApiErrorResponse>) => void,
            config: originalRequest,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // STEP 2.5: Ambil refresh token dari adminTokenStorage
      const refreshToken = adminTokenStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        adminTokenStorage.clearTokens();
        return Promise.reject(error);
      }

      try {
        console.log('Attempting to refresh SUPER ADMIN token...');
        
        // STEP 2.6: Panggil endpoint refresh token SUPER ADMIN
        const rs = await axios.post<LoginResponse>(
          `${API_BASE_URL}/admin/auth/refresh`, // Ganti endpoint
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = rs.data;
        
        // STEP 2.7: Simpan token baru ke adminTokenStorage
        adminTokenStorage.setTokens({ accessToken, refreshToken: newRefreshToken });
        
        // Perbarui header default instance 'adminApi'
        adminApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApi(originalRequest); // Panggil ulang pakai 'adminApi'
        
      } catch (refreshError) {
        console.error('Super Admin Token refresh failed:', refreshError);
        adminTokenStorage.clearTokens(); // Hapus token admin
        processQueue(refreshError as AxiosError<ApiErrorResponse>, null);
        return Promise.reject(refreshError as AxiosError<ApiErrorResponse>);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Utility 'parseApiError' tetap sama, bisa diekspor dari sini
// atau impor dari lib/api.ts jika mau (agar tidak duplikat)
export const parseApiError = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
    return error.response.data;
  }
  return {
    statusCode: 500,
    message: (error instanceof Error) ? error.message : 'Terjadi kesalahan tidak diketahui.',
    error: 'Network Error or Unknown',
  };
};