// frontend/services/superadmin.service.ts
import { adminApi, parseApiError } from '@/lib/adminApi';
import { Tenant } from '@/types/api.types'; // <-- Impor tipe Tenant yang baru

// Tipe untuk body request reject
interface RejectTenantDto {
  reason: string;
}

// Wrapper handleRequest (biarkan apa adanya)
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
   * Mengambil daftar SEMUA tenant (termasuk PENDING, APPROVED, REJECTED).
   * Endpoint: GET /tenants
   */
  getAllTenants: (): Promise<Tenant[]> => {
    return handleRequest(adminApi.get<Tenant[]>('/tenants'));
  },

  /**
   * Mengambil daftar pendaftaran tenant (koperasi) yang PENDING.
   * Endpoint: GET /tenants/pending
   */
  getPendingTenants: (): Promise<Tenant[]> => {
    // Gunakan Tipe Tenant yang baru
    return handleRequest(adminApi.get<Tenant[]>('/tenants/pending'));
  },

  /**
   * Menyetujui pendaftaran tenant (koperasi).
   * Endpoint: POST /tenants/{id}/approve
   */
  approveTenant: (tenantId: string): Promise<{ message: string }> => {
    return handleRequest(adminApi.post<{ message: string }>(`/tenants/${tenantId}/approve`));
  },

  /**
   * Menolak pendaftaran tenant (koperasi).
   * Endpoint: POST /tenants/{id}/reject
   */
  rejectTenant: (tenantId: string, reason: string): Promise<{ message: string }> => {
    const payload: RejectTenantDto = { reason };
    return handleRequest(adminApi.post<{ message: string }>(`/tenants/${tenantId}/reject`, payload));
  },

  /**
   * Menonaktifkan (suspend) tenant.
   * Endpoint: POST /tenants/{id}/suspend
   */
  suspendTenant: (tenantId: string): Promise<Tenant> => {
    return handleRequest(adminApi.post<Tenant>(`/tenants/${tenantId}/suspend`));
  },

  /**
   * Mengaktifkan kembali tenant yang di-suspend.
   * Endpoint: POST /tenants/{id}/activate
   */
  activateTenant: (tenantId: string): Promise<Tenant> => {
    return handleRequest(adminApi.post<Tenant>(`/tenants/${tenantId}/activate`));
  },
  
  /**
   * Menghapus tenant (koperasi) secara permanen.
   * Endpoint: DELETE /tenants/{id}
   */
  deleteTenant: (tenantId: string): Promise<{ message: string }> => {
    return handleRequest(adminApi.delete<{ message: string }>(`/tenants/${tenantId}`));
  },
};