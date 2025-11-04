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
  status: string; // 'ACTIVE', 'INACTIVE', dll.
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

export type InventoryCondition = 'BAIK' | 'PERLU_PERBAIKAN' | 'RUSAK';

export type InventoryItem = {
  id: string;
  itemCode: string;
  itemName: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  technicalLifeSpan?: number | null;
  economicLifeSpan?: number | null;
  condition: InventoryCondition;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInventoryItemDto = {
  itemName: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  technicalLifeSpan?: number;
  economicLifeSpan?: number;
  condition?: InventoryCondition;
  location?: string;
  notes?: string;
};

export type UpdateInventoryItemDto = Partial<CreateInventoryItemDto>;

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

export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    try {
      const { data } = await api.get<InventoryItem[]>('/inventory');
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error fetching inventory items:', error);
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message || 'Gagal mengambil data inventaris';
      toast.error(errorMessage);
      throw error;
    }
  },

  create: async (
    payload: CreateInventoryItemDto,
  ): Promise<InventoryItem> => {
    try {
      const { data } = await api.post<InventoryItem>('/inventory', payload);
      toast.success('Item inventaris berhasil ditambahkan');
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error('Error creating inventory item:', error);
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message || 'Gagal menambahkan item inventaris';
      toast.error(errorMessage);
      throw error;
    }
  },

  update: async (
    id: string,
    payload: UpdateInventoryItemDto,
  ): Promise<InventoryItem> => {
    try {
      const { data } = await api.patch<InventoryItem>(
        `/inventory/${id}`,
        payload,
      );
      toast.success('Item inventaris berhasil diperbarui');
      return data;
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error(`Error updating inventory item ${id}:`, error);
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message || 'Gagal memperbarui item inventaris';
      toast.error(errorMessage);
      throw error;
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Item inventaris berhasil dihapus');
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      console.error(`Error deleting inventory item ${id}:`, error);
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message || 'Gagal menghapus item inventaris';
      toast.error(errorMessage);
      throw error;
    }
  },
};
