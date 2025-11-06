// frontend/services/superadmin.service.ts
import { adminApi, parseApiError } from "@/lib/adminApi";
import { Tenant } from "@/types/api.types"; // <-- Impor tipe Tenant yang baru

// Tipe untuk body request reject
interface RejectTenantDto {
  reason: string;
}

export interface PlatformSetting {
  key: string; // Sesuai DTO
  value: string; // Sesuai DTO
  // id dan updatedAt mungkin tidak selalu dikembalikan, buat opsional
  id?: string;
  updatedAt?: Date;
}

// Tipe untuk DTO update
export interface UpdatePlatformSettingDto {
  key: string;
  value: string;
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
    return handleRequest(adminApi.get<Tenant[]>("/tenants"));
  },

  /**
   * Mengambil daftar pendaftaran tenant (koperasi) yang PENDING.
   * Endpoint: GET /tenants/pending
   */
  getPendingTenants: (): Promise<Tenant[]> => {
    // Gunakan Tipe Tenant yang baru
    return handleRequest(adminApi.get<Tenant[]>("/tenants/pending"));
  },

  /**
   * Menyetujui pendaftaran tenant (koperasi).
   * Endpoint: POST /tenants/{id}/approve
   */
  approveTenant: (tenantId: string): Promise<{ message: string }> => {
    return handleRequest(
      adminApi.post<{ message: string }>(`/tenants/${tenantId}/approve`)
    );
  },

  /**
   * Menolak pendaftaran tenant (koperasi).
   * Endpoint: POST /tenants/{id}/reject
   */
  rejectTenant: (
    tenantId: string,
    reason: string
  ): Promise<{ message: string }> => {
    const payload: RejectTenantDto = { reason };
    return handleRequest(
      adminApi.post<{ message: string }>(`/tenants/${tenantId}/reject`, payload)
    );
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
    return handleRequest(
      adminApi.post<Tenant>(`/tenants/${tenantId}/activate`)
    );
  },

  /**
   * Menghapus tenant (koperasi) secara permanen.
   * Endpoint: DELETE /tenants/{id}
   */
  deleteTenant: (tenantId: string): Promise<{ message: string }> => {
    return handleRequest(
      adminApi.delete<{ message: string }>(`/tenants/${tenantId}`)
    );
  },

  /**
   * [BARU] Mengambil pengaturan platform publik (nama platform, dll)
   * Endpoint: GET /admin/platform-settings/public
   */
  getPublicPlatformSettings: (): Promise<Record<string, string>> => {
    // Hapus params, endpoint ini sekarang mengembalikan semua
    return handleRequest(
      adminApi.get<Record<string, string>>("/admin/platform-settings/public")
    );
  },

  /**
   * [BARU] Mengambil SEMUA pengaturan platform (Untuk Admin)
   * Endpoint: GET /admin/platform-settings
   */
  getAllPlatformSettings: (): Promise<Record<string, string>> => {
    return handleRequest(
      adminApi.get<Record<string, string>>("/admin/platform-settings")
    );
  },

  /**
   * [BARU] Memperbarui pengaturan platform (Untuk Admin)
   * Endpoint: PATCH /admin/platform-settings/:key
   */
  updateSettings: (
    updates: UpdatePlatformSettingDto[]
  ): Promise<{ message: string }> => {
    return handleRequest(
      adminApi.patch<{ message: string }>(
        "/admin/platform-settings", // Panggil root @Patch()
        updates // Kirim array-nya
      )
    );
  },

  /**
   * [BARU] Mengunggah gambar pengaturan platform (Untuk Admin)
   * Endpoint: POST /admin/platform-settings/image
   */
  uploadPlatformSettingImage: (
    key: string,
    file: File
  ): Promise<PlatformSetting> => {
    const formData = new FormData();
    formData.append("settingKey", key);
    formData.append("file", file);

    return handleRequest(
      adminApi.post<PlatformSetting>(
        "/admin/platform-settings/upload-image",
        formData
      )
    );
  },
};
