// lib/apiService.ts
import { toast } from 'react-toastify';
import { api, parseApiError } from '@/lib/api';

// Define types
export type Loan = {
  id: string;
  loanNumber: string;
  memberId: string;
  loanAmount: number;
  interestRate: number;
  loanDate: string;
  termMonths: number;
  dueDate: string;
  purpose?: string;
  agreementNumber?: string;
  status: string;
  paidOffDate?: string | null;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    fullName: string;
    occupation: string;
  };
};

export type SimpananTransaksi = {
  id: string;
  tanggal: string;
  nomorBukti?: string;
  uraian: string;
  jenis: string;
  tipe: string;
  jumlah: number;
  memberId: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    fullName: string;
  };
};

export type Member = {
  id: string;
  memberNumber: string;
  fullName: string;
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  phoneNumber?: string;
  gender: string;
  occupation: string;
  address: string;
  joinDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CreateLoanDto = {
  memberId: string;
  loanAmount: number;
  interestRate: number;
  loanDate: string;
  termMonths: number;
  purpose?: string;
  agreementNumber?: string;
};

export type CreateSimpananTransaksiDto = {
  memberId: string;
  jenis: 'POKOK' | 'WAJIB' | 'SUKARELA';
  tipe: 'SETORAN' | 'PENARIKAN';
  jumlah: number;
  uraian: string;
  nomorBukti?: string;
};

export type TotalSaldo = {
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
};

// Requests use unified Axios instance (lib/api) that already
// attaches tokens and handles 401 refresh.

// API service functions for Loans
export const loanApi = {
  // Get all loans
  getAllLoans: async (): Promise<Loan[]> => {
    try {
      const { data } = await api.get<Loan[]>(`/loans`);
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error fetching loans:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mengambil data pinjaman');
      toast.error(errorMessage);
      throw error;
    }
  },

  // Create a new loan
  createLoan: async (loanData: CreateLoanDto): Promise<Loan> => {
    try {
      const { data } = await api.post<Loan>(`/loans`, loanData);
      toast.success('Pinjaman berhasil dicatat');
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error creating loan:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mencatat pinjaman');
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get a specific loan by ID
  getLoanById: async (id: string): Promise<Loan> => {
    try {
      const { data } = await api.get<Loan>(`/loans/${id}`);
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error fetching loan:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mengambil detail pinjaman');
      toast.error(errorMessage);
      throw error;
    }
  },
};

// API service functions for Simpanan
export const simpananApi = {
  // Get all simpanan transactions
  getAllTransactions: async (): Promise<SimpananTransaksi[]> => {
    try {
      const { data } = await api.get<SimpananTransaksi[]>(`/simpanan/transaksi`);
      return data;
    } catch (error: unknown) {
      const { message, statusCode } = parseApiError(error);
      if (statusCode === 403) {
        // Non-bendahara: anggap tidak ada akses, jangan naikkan error agar tidak memicu overlay Next
        return [];
      }
      console.error('Error fetching simpanan transactions:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mengambil data transaksi simpanan');
      toast.error(errorMessage);
      throw error;
    }
  },

  // Create a new simpanan transaction
  createTransaction: async (transactionData: CreateSimpananTransaksiDto): Promise<SimpananTransaksi> => {
    try {
      const { data } = await api.post<SimpananTransaksi>(`/simpanan/transaksi`, transactionData);
      toast.success('Transaksi berhasil dicatat');
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error creating transaction:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mencatat transaksi');
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get total saldo
  getTotalSaldo: async (): Promise<TotalSaldo> => {
    try {
      const { data } = await api.get<TotalSaldo>(`/simpanan/saldo/total`);
      return data;
    } catch (error: unknown) {
      const { message, statusCode } = parseApiError(error);
      if (statusCode === 403) {
        // Non-bendahara: kembalikan nol agar UI tetap aman tanpa overlay
        return { saldoPokok: 0, saldoWajib: 0, saldoSukarela: 0 };
      }
      console.error('Error fetching total saldo:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mengambil total saldo simpanan');
      toast.error(errorMessage);
      throw error;
    }
  },
};

// API service functions for Members
export const memberApi = {
  // Get all members
  getAllMembers: async (): Promise<Member[]> => {
    try {
      const { data } = await api.get<Member[]>(`/members`);
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error fetching members:', error);
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Gagal mengambil data anggota');
      toast.error(errorMessage);
      throw error;
    }
  },
};
