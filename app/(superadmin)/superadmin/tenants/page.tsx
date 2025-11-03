// Salin dan Timpa seluruh kode di:
// frontendKopMerahPutih-loginsuperadmin/app/(superadmin)/superadmin/tenants/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Tenant } from "@/types/api.types";
import { superAdminService } from "@/services/superadmin.service"; // <-- Impor service Anda
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import {
  FiEye,
  FiTrash2,
  FiAlertTriangle,
  FiPause, // <-- Tambahkan ini
  FiPlay,
} from "react-icons/fi";
import AdminPageHeader from "@/components/AdminPageHeader";
import TenantDetailModal from "@/components/TenantDetailModal"; // <-- Impor modal baru

// Helper untuk Badge Status
const StatusBadge: React.FC<{ status: Tenant["status"] }> = ({ status }) => {
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-red-100 text-red-800",
  };
  const statusText = {
    ACTIVE: "Aktif",
    PENDING: "Menunggu Persetujuan",
    SUSPENDED: "Ditangguhkan/Ditolak",
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusText[status] || status}
    </span>
  );
};

export default function ManajemenTenantPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const fetchAllTenants = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAllTenants(); // <-- Panggil service Anda
      setTenants(data);
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Gagal memuat daftar koperasi";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTenants();
  }, []);

  const handleDelete = async (tenantId: string, tenantName: string) => {
    if (
      !window.confirm(
        `APAKAH ANDA YAKIN ingin menghapus koperasi "${tenantName}" (${tenantId})?\n\nTindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.`
      )
    ) {
      return;
    }
    try {
      await superAdminService.deleteTenant(tenantId); // <-- Panggil service Anda
      toast.success(`Koperasi "${tenantName}" berhasil dihapus.`);
      // Refresh daftar
      fetchAllTenants();
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Gagal menghapus koperasi";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // --- TAMBAHKAN KODE INI ---
  const handleSuspend = async (tenant: Tenant) => {
    const tenantName = tenant.registration?.cooperativeName || tenant.name;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin MENONAKTIFKAN koperasi "${tenantName}"?`
      )
    ) {
      return;
    }
    try {
      await superAdminService.suspendTenant(tenant.id);
      toast.success(`Koperasi "${tenantName}" berhasil dinonaktifkan.`);
      fetchAllTenants(); // Refresh data
    } catch (error: unknown) {
      // (Kita gunakan 'unknown' agar lolos ESLint)
      console.error(error);
      let errorMessage = "Gagal menonaktifkan koperasi";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleActivate = async (tenant: Tenant) => {
    const tenantName = tenant.registration?.cooperativeName || tenant.name;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin MENGAKTIFKAN KEMBALI koperasi "${tenantName}"?`
      )
    ) {
      return;
    }
    try {
      await superAdminService.activateTenant(tenant.id);
      toast.success(`Koperasi "${tenantName}" berhasil diaktifkan.`);
      fetchAllTenants(); // Refresh data
    } catch (error: unknown) {
      // (Kita gunakan 'unknown' agar lolos ESLint)
      console.error(error);
      let errorMessage = "Gagal mengaktifkan koperasi";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminPageHeader
        title="Manajemen Koperasi"
        description="Kelola semua koperasi yang terdaftar di platform."
      />

      {loading && <div className="text-center py-10">Memuat data...</div>}

      {!loading && tenants.length === 0 && (
        <div className="text-center py-10 bg-white shadow rounded-lg">
          <FiAlertTriangle className="mx-auto text-5xl text-yellow-500" />
          <p className="mt-4 text-gray-600">
            Belum ada koperasi yang terdaftar.
          </p>
        </div>
      )}

      {!loading && tenants.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Koperasi
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subdomain
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIC
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap font-medium">
                    {/* Ambil nama dari 'registration' jika ada, jika tidak (data lama) pakai 'tenant.name' */}
                    {tenant.registration
                      ? tenant.registration.cooperativeName
                      : tenant.name}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                    {tenant.subdomain}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                    {/* Ambil PIC dari 'registration' */}
                    {tenant.registration
                      ? tenant.registration.picFullName
                      : "(Data Manual)"}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTenant(tenant)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      title="Lihat Detail"
                    >
                      <FiEye size={18} />
                    </button>
                    {tenant.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleSuspend(tenant)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Nonaktifkan Koperasi"
                      >
                        <FiPause size={18} />
                      </button>
                    )}

                    {/* Tampilkan Tombol AKTIFKAN jika status SUSPENDED */}
                    {tenant.status === 'SUSPENDED' && (
                      <button
                        onClick={() => handleActivate(tenant)}
                        className="text-green-600 hover:text-green-800"
                        title="Aktifkan Koperasi"
                      >
                        <FiPlay size={18} />
                      </button>
                    )}
                    {/* Tampilkan tombol Hapus hanya jika status BUKAN PENDING */}
                    {tenant.status !== "PENDING" ? (
                      <button
                        onClick={() =>
                          handleDelete(
                            tenant.id,
                            tenant.registration?.cooperativeName || tenant.name
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Hapus Koperasi"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    ) : (
                      <span title="Setujui/Tolak di halaman Persetujuan">
                        <FiTrash2 size={18} className="text-gray-300" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Modal Detail */}
      {selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      )}
    </div>
  );
}
