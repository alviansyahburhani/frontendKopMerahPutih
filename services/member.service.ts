// frontend/services/member.service.ts
import { api, parseApiError } from '@/lib/api';
import { SimpananSaldo, Loan } from '@/types/api.types';
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