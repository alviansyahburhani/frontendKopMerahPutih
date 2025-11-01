// services/public.service.ts
import { api, parseApiError } from '@/lib/api';
import { CreateGuestBookDto, GuestBookEntry } from '@/types/api.types';

async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
    try {
      const { data } = await request;
      return data;
    } catch (error) {
      throw parseApiError(error);
    }
  }

export const publicService = {
    /**
     * Mengirim data buku tamu (Publik)
     * Endpoint: POST /guest-book
     */
    createGuestBookEntry: (
      dto: CreateGuestBookDto,
    ): Promise<GuestBookEntry> => {
      // Perhatikan: ini memanggil 'api' (axios instance) yang sudah
      // di-setup di lib/apiService.ts untuk menangani subdomain secara otomatis.
      return handleRequest(api.post<GuestBookEntry>('/guest-book', dto));
    },
};