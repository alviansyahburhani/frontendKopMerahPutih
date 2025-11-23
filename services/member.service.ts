// frontend/services/member.service.ts
import { api, parseApiError } from '@/lib/api';
import { SimpananSaldo, MemberProfile, UpdateMyProfileDto, Loan } from '@/types/api.types';
import { GuestBookEntry } from '@/types/api.types';

/**
 * Wrapper untuk menangani request dan mengembalikan data atau melempar error yang bersih.
 */
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// DTO untuk mengirim saran (sesuai backend CreateMemberSuggestionDto)
export interface SubmitSuggestionDto {
  suggestion: string;
  signatureUrl?: string; // Opsional
}

// Tipe data yang diterima dari GET /member-suggestion
export interface MemberSuggestionResponse {
  id: string;
  suggestion: string;
  response: string | null;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    fullName: string;
    address: string;
  };
  responseByUser: {
    id: string;
    fullName: string;
  } | null;
}

export const memberService = {

  /**
   * Mengambil data profil lengkap anggota yang login.
   * Endpoint: GET /profile/me
   */
  getMyProfile: (): Promise<MemberProfile> => {
    return handleRequest(api.get<MemberProfile>('/profile/me'));
  },

  /**
   * Memperbarui data profil anggota yang login.
   */
  updateMyProfile: (dto: UpdateMyProfileDto): Promise<MemberProfile> => {
    return handleRequest(api.patch<MemberProfile>('/profile/me', dto));
  },

  /**
   * Mengambil daftar buku tamu
   * Endpoint: GET /guest-book
   */
  getGuestBookEntries: (): Promise<GuestBookEntry[]> => {
    return handleRequest(api.get<GuestBookEntry[]>('/guest-book'));
  },

  /**
   * Mengambil saldo simpanan untuk anggota yang sedang login.
   * Endpoint: GET /simpanan/saldo/saya
   */
  getSaldoSimpanan: (): Promise<SimpananSaldo> => {
    return handleRequest(api.get<SimpananSaldo>('/simpanan/saldo/saya'));
  },

  /**
   * Mengambil riwayat transaksi simpanan milik anggota yang login
   * Endpoint: GET /simpanan/transaksi/saya
   */
  getMyTransaksi: (): Promise<any[]> => {
    return handleRequest(api.get<any[]>('/simpanan/transaksi/saya'));
  },

  /**
   * Mengambil daftar pinjaman milik anggota yang sedang login.
   * Backend otomatis filter berdasarkan role dari JWT token.
   * Endpoint: GET /loans (BUKAN /loans/my-loans)
   */
  getMyLoans: (): Promise<Loan[]> => {
    return handleRequest(api.get<Loan[]>('/loans'));
  },

  /**
   * Mengirimkan saran baru dari anggota yang login
   * Endpoint: POST /member-suggestion
   */
  submitSuggestion: (dto: SubmitSuggestionDto): Promise<MemberSuggestionResponse> => {
    return handleRequest(api.post<MemberSuggestionResponse>('/member-suggestion', dto));
  },

  /**
   * Mengambil riwayat saran HANYA untuk anggota yang login
   * Endpoint: GET /member-suggestion
   */
  getMySuggestions: (): Promise<MemberSuggestionResponse[]> => {
    return handleRequest(api.get<MemberSuggestionResponse[]>('/member-suggestion'));
  },
};