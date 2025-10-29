// frontend/services/superadmin.service.ts
import { api, parseApiError, ApiErrorResponse } from '@/lib/api';

// Tipe data untuk tenant yang pending (sesuaikan dengan response GET /tenants/pending)
export interface PendingTenant {
  id: string;
  name: string; // Nama Koperasi
  subdomain: string;
  schemaName?: string; // Opsional
  status: 'PENDING';
  createdAt: string;
  updatedAt: string;
  // Tambahkan field lain jika backend mengirimkannya (misal: email PIC, nama PIC)
  picEmail?: string;
  picName?: string;
  city?: string; // Tambahkan jika ada
  province?: string; // Tambahkan jika ada
  phoneNumber?: string; // Tambahkan jika ada
}

// Tipe untuk body request reject (asumsi)
interface RejectTenantDto {
  reason: string;
}

// Wrapper handleRequest
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export const superAdminService = {
  /**
   * Mengambil daftar pendaftaran tenant (koperasi) yang pending.
   * Endpoint: GET /tenants/pending
   */
  getPendingTenants: (): Promise<PendingTenant[]> => {
    return handleRequest(api.get<PendingTenant[]>('/tenants/pending'));
  },

  /**
   * Menyetujui pendaftaran tenant (koperasi).
   * Endpoint: POST /tenants/{id}/approve
   */
  approveTenant: (tenantId: string): Promise<{ message: string }> => {
    return handleRequest(api.post<{ message: string }>(`/tenants/${tenantId}/approve`));
  },

  /**
   * Menolak pendaftaran tenant (koperasi).
   * Endpoint: POST /tenants/{id}/reject
   * Mengirim alasan dalam body request (asumsi)
   */
  rejectTenant: (tenantId: string, reason: string): Promise<{ message: string }> => {
    const payload: RejectTenantDto = { reason };
    return handleRequest(api.post<{ message: string }>(`/tenants/${tenantId}/reject`, payload));
  },

  // Fungsi lain bisa ditambahkan di sini
};