// frontend/services/member.service.ts
import { api, parseApiError } from '@/lib/api';
import { SimpananSaldo, Loan } from '@/types/api.types';

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

export const memberService = {
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
};