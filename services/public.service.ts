// services/public.service.ts
import { api, parseApiError } from '@/lib/api';
import { 
  PaginatedNewsResult,
  CreateGuestBookDto, 
  GuestBookEntry,
  News,
  ApiErrorResponse 
} from '@/types/api.types';
import { 
  GalleryItem,
  PaginatedResult 
  } from '@/types/api.types';
import axios, { AxiosError } from 'axios';


type RequestParams = Record<string, string | number | boolean | undefined>;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string | null;
  sku: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  category: {
    name: string;
    slug: string;
  };
}

export interface PaginatedProductsResult {
  data: Product[];
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// Helper 'handleRequest' Bawaan Anda (untuk client-side)
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// [PERBAIKAN] Helper untuk request Server-Side
async function handleServerRequest<T>(
  host: string, // Ini adalah 'kerenjaya.localhost:3000'
  path: string,
  params?: RequestParams,
): Promise<T> {
  
  // 1. Tentukan URL Backend. Saat dipanggil dari server, kita SELALU
  //    menggunakan 'localhost:3002' agar tidak error ENOTFOUND.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  
  // [FIX] Ganti domain di apiUrl (jika bukan localhost) menjadi 'localhost'
  const baseUrl = apiUrl.replace(/^(http:\/\/)[^:]+/, '$1localhost'); 

  // 2. Buat header 'Origin' dan 'Host' manual.
  //    TenancyMiddleware di backend akan membaca header ini.
  const requestHeaders = {
    'Origin': `http://${host}`, // -> "Origin: http://kerenjaya.localhost:3000"
    'Host': host,               // -> "Host: kerenjaya.localhost:3000"
  };

  try {
    // 3. Lakukan panggilan ke 'localhost:3002' dengan header kustom
    const response = await axios.get<T>(`${baseUrl}${path}`, { 
      params,
      headers: requestHeaders // <-- [FIX] Header sekarang dikirim
    });
    return response.data;
  } catch (error) {
    // Logika error handling Anda
    const err = error as AxiosError;
    
    // [FIX] Tangani error ENOTFOUND dengan lebih jelas
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
      throw {
        message: `[Server Fetch Error] Gagal terhubung ke backend di ${baseUrl}. Error: ${err.message}`,
        statusCode: 500,
        error: 'Server Fetch Error',
      } as ApiErrorResponse;
    }

    if (err.response) {
      const apiError = err.response.data as Partial<ApiErrorResponse> | undefined;
      const message = apiError?.message ?? 'Server error';
      const statusCode =
        typeof apiError?.statusCode === 'number'
          ? apiError.statusCode
          : err.response.status ?? 500;
      const errorName = apiError?.error ?? 'Internal Server Error';
      throw {
        message,
        statusCode,
        error: errorName,
      } as ApiErrorResponse;
    }

    throw {
      message: err.message,
      statusCode: 500,
      error: 'Server Fetch Error',
    } as ApiErrorResponse;
  }
}

export const publicService = {

  /**
   * [Galeri] Mengambil item galeri untuk 'use client' components
   * Endpoint: GET /gallery
   */
  getPublicGalleryClient: (
    page: number = 1,
    limit: number = 6
  ): Promise<PaginatedResult<GalleryItem>> => {
    // Menggunakan 'api' (dari lib/api) yang otomatis menangani subdomain
    return handleRequest(
      api.get<PaginatedResult<GalleryItem>>('/gallery', {
        params: { page, limit },
      })
    );
  },
  /**
   * [Galeri] Mengambil item galeri yang terbit (Publik)
   * Dijalankan di Server, butuh 'host'
   * Endpoint: GET /gallery (ini adalah endpoint publik sesuai analisis)
   */
  getPublicGallery: (
    host: string,
    page: number = 1,
    limit: number = 100 // Ambil 100 gambar
  ): Promise<PaginatedResult<GalleryItem>> => {

    return handleServerRequest<PaginatedResult<GalleryItem>>(
      host,
      '/gallery', // Endpoint ini (GET /gallery) adalah publik
      { page, limit }
    );
  },


  // Untuk 'use client' components seperti landing page
  getPublishedNewsClient: (page = 1, limit = 10): Promise<PaginatedNewsResult> => {
    // Menggunakan 'api' (dari lib/api) yang otomatis menangani subdomain
    return handleRequest(
      api.get<PaginatedNewsResult>('/articles', {
        params: { page, limit },
      })
    );
  },
  
  // --- Service Produk (Client-Side) ---
  getPublishedProductsClient: (page = 1, limit = 10): Promise<PaginatedProductsResult> => {
    // Menggunakan 'api' (dari lib/api)
    return handleRequest(
      api.get<PaginatedProductsResult>('/products', {
        params: { page, limit },
      })
    );
  },

  // --- Service Produk (Server-Side) ---
  getPublishedProducts: (
    page = 1,
    limit = 10,
    host: string,
    categorySlug?: string,
  ): Promise<PaginatedProductsResult> => {
    const params: Record<string, string | number> = { page, limit };
    if (categorySlug) {
      params.category = categorySlug;
    }

    return handleServerRequest<PaginatedProductsResult>(
      host,
      '/products',
      params,
    );
  },



  /**
   * Mengirim data buku tamu (Publik)
   * Dijalankan di Client, jadi 'api' (dari lib/api) aman digunakan
   */
  createGuestBookEntry: (
    dto: CreateGuestBookDto,
  ): Promise<GuestBookEntry> => {
    return handleRequest(api.post<GuestBookEntry>('/guest-book', dto));
  },

  // ===============================================
  // SERVICE PUBLIK BERITA (ARTICLES)
  // ===============================================

  /**
   * [Berita] Mengambil artikel yang sudah terbit (paginasi)
   * Dijalankan di Server, butuh 'host'
   */
  getPublishedNews: (page = 1, limit = 10, host: string): Promise<PaginatedNewsResult> => {
    // Gunakan handleServerRequest
    return handleServerRequest<PaginatedNewsResult>(
      host, 
      '/articles', 
      { page, limit }
    );
  },

  /**
   * [Berita] Mengambil satu artikel terbit berdasarkan slug
   * Dijalankan di Server, butuh 'host'
   */
  getNewsBySlug: (slug: string, host: string): Promise<News> => {
    // Gunakan handleServerRequest
    return handleServerRequest<News>(
      host, 
      `/articles/${slug}`
    );
  },

  /**
   * [BARU] Mengambil profil publik koperasi (nama, alamat, dll)
   * Dijalankan di Client, menggunakan 'api' (tenant-aware)
   * Endpoint: GET /cooperative-profile
   */
  getPublicCooperativeProfile: (): Promise<{ displayName: string; [key: string]: unknown }> => {
    return handleRequest(api.get<{ displayName: string }>('/cooperative-profile/public'));
  },
};
