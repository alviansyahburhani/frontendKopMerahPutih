// frontend/services/member.service.ts
import { api, parseApiError } from '@/lib/api';
import { SimpananSaldo,MemberProfile,UpdateMyProfileDto, Loan } from '@/types/api.types';
import {GuestBookEntry } from '@/types/api.types';

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
  createdAt: string; // Tanggal saran dibuat
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
   * [BARU] Mengambil data profil lengkap anggota yang login.
   * Endpoint: GET /profile/me
   */
  getMyProfile: (): Promise<MemberProfile> => {
    return handleRequest(api.get<MemberProfile>('/profile/me'));
  },

/**
   * [MODIFIKASI] Memperbarui data profil anggota yang login.
   * Menggunakan DTO yang benar (UpdateMyProfileDto)
   */
  updateMyProfile: (
    dto: UpdateMyProfileDto, // <-- [DIUBAH] Gunakan DTO yang benar
  ): Promise<MemberProfile> => {
    // Endpoint tetap sama (PATCH /profile/me)
    return handleRequest(api.patch<MemberProfile>('/profile/me', dto));
  },



  /**
   * [BARU] Mengambil daftar buku tamu (Perlu login Anggota)
   * Endpoint: GET /guest-book
   */
  getGuestBookEntries: (): Promise<GuestBookEntry[]> => {
    return handleRequest(api.get<GuestBookEntry[]>('/guest-book'));
  },


  /**
   * Mengambil saldo simpanan (pokok, wajib, sukarela)
   * untuk anggota yang sedang login.
   * Endpoint: GET /simpanan/saldo
   */
  getSaldoSimpanan: (): Promise<SimpananSaldo> => {
    // Endpoint ini otomatis mengambil userId dari token di backend
    return handleRequest(api.get<SimpananSaldo>('/simpanan/saldo'));
  },

  /**
   * Mengambil daftar pinjaman milik anggota yang sedang login.
   * Endpoint: GET /loans/my-loans
   */
  getMyLoans: (): Promise<Loan[]> => {
    // Endpoint ini juga otomatis mengambil userId dari token
    return handleRequest(api.get<Loan[]>('/loans/my-loans'));
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