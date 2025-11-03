// Salin dan Timpa seluruh kode di:
// frontendKopMerahPutih-loginsuperadmin/app/(superadmin)/superadmin/persetujuan-koperasi/page.tsx

"use client";

import React, { useState, useEffect } from "react"; // Import React
import { Tenant } from "@/types/api.types";
import { superAdminService } from "@/services/superadmin.service";
import { toast } from "react-hot-toast";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import AdminPageHeader from "@/components/AdminPageHeader"; // Asumsi Anda punya komponen ini
import { AxiosError } from "axios";
// Tipe untuk Modal Penolakan
interface RejectModalState {
  isOpen: boolean;
  tenantId: string | null;
  reason: string;
}

export default function PersetujuanKoperasiPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null); // State untuk detail
  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    isOpen: false,
    tenantId: null,
    reason: "",
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getPendingTenants();
      setTenants(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat daftar persetujuan koperasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleApprove = async (tenantId: string) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin MENYETUJUI pendaftaran koperasi ini?"
      )
    ) {
      return;
    }
    try {
      await superAdminService.approveTenant(tenantId);
      toast.success("Koperasi berhasil disetujui.");
      // Refresh daftar
      fetchTenants();
    } catch (error: unknown) {
      // Ubah 'any' menjadi 'unknown'
      console.error(error);
      let errorMessage = "Gagal menyetujui";
      // Tambahkan pengecekan tipe error
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const openRejectModal = (tenantId: string) => {
    setRejectModal({ isOpen: true, tenantId: tenantId, reason: "" });
  };

  const closeRejectModal = () => {
    setRejectModal({ isOpen: false, tenantId: null, reason: "" });
  };

  const handleReject = async () => {
    if (!rejectModal.tenantId || !rejectModal.reason) {
      toast.error("Alasan penolakan tidak boleh kosong.");
      return;
    }
    try {
      await superAdminService.rejectTenant(
        rejectModal.tenantId,
        rejectModal.reason
      );
      toast.success("Koperasi berhasil ditolak.");
      closeRejectModal();
      // Refresh daftar
      fetchTenants();
    } catch (error: unknown) {
      // Ubah 'any' menjadi 'unknown'
      console.error(error);
      let errorMessage = "Gagal menolak";
      // Tambahkan pengecekan tipe error
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // Helper function untuk render link dokumen
  const renderLink = (url: string | null | undefined, text: string) => {
    if (!url) {
      return (
        <span className="text-gray-500 italic">
          <FiXCircle className="inline -mt-1 mr-1" />
          {text} (Tidak Ada)
        </span>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        <FiCheckCircle className="inline -mt-1 mr-1 text-green-500" />
        Lihat {text}
      </a>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminPageHeader
        title="Persetujuan Koperasi"
        description="Setujui atau tolak pendaftaran koperasi baru yang masuk."
      />

      {loading && <div className="text-center py-10">Loading...</div>}

      {!loading && tenants.length === 0 && (
        <div className="text-center py-10 bg-white shadow rounded-lg">
          <FiCheckCircle className="mx-auto text-5xl text-green-500" />
          <p className="mt-4 text-gray-600">
            Tidak ada pendaftaran koperasi yang menunggu persetujuan.
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
                  Nama PIC
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email PIC
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <React.Fragment key={tenant.id}>
                  <tr className="hover:bg-gray-50">
                    {/* --- PERBAIKAN PENTING DI SINI --- */}
                    <td className="py-4 px-4 whitespace-nowrap font-medium">
                      {/* Ambil nama dari 'registration' jika ada, jika tidak (data lama) pakai 'tenant.name' */}
                      {tenant.registration
                        ? tenant.registration.cooperativeName
                        : tenant.name}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                      {tenant.subdomain}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                      {/* Ambil PIC dari 'registration' */}
                      {tenant.registration
                        ? tenant.registration.picFullName
                        : "(Data Manual)"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                      {/* Ambil Email dari 'registration' */}
                      {tenant.registration
                        ? tenant.registration.email
                        : "(Data Manual)"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                      <button
                        onClick={() =>
                          setExpandedTenantId(
                            expandedTenantId === tenant.id ? null : tenant.id
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        title="Lihat Detail"
                      >
                        {expandedTenantId === tenant.id ? (
                          <FiChevronUp className="mr-1" />
                        ) : (
                          <FiChevronDown className="mr-1" />
                        )}
                        {expandedTenantId === tenant.id ? "Tutup" : "Detail"}
                      </button>
                      <button
                        onClick={() => handleApprove(tenant.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Setujui"
                      >
                        <FiCheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => openRejectModal(tenant.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Tolak"
                      >
                        <FiXCircle size={18} />
                      </button>
                    </td>
                  </tr>

                  {/* --- BARIS DETAIL (COLLAPSIBLE) --- */}
                  {expandedTenantId === tenant.id && (
                    <tr className="bg-gray-100">
                      <td colSpan={5} className="p-4">
                        {!tenant.registration && (
                          <div className="text-center text-gray-600 p-4">
                            <FiAlertTriangle className="inline-block mr-2" />
                            Data registrasi tidak ditemukan. Ini mungkin data
                            lama yang dibuat manual.
                          </div>
                        )}
                        {tenant.registration && (
                          <div>
                            <h4 className="font-bold text-lg mb-3 text-gray-800">
                              Detail Lengkap Pendaftaran
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Kolom 1: Info PIC */}
                              <div className="space-y-2">
                                <h5 className="font-semibold text-gray-700 border-b pb-1 mb-2">
                                  Informasi PIC
                                </h5>
                                <p>
                                  <strong>Nama:</strong>{" "}
                                  {tenant.registration.picFullName}
                                </p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {tenant.registration.email}
                                </p>
                                <p>
                                  <strong>No. HP:</strong>{" "}
                                  {tenant.registration.picPhoneNumber}
                                </p>
                                <p>
                                  <strong>NIK:</strong>{" "}
                                  {tenant.registration.picNik}
                                </p>
                                <p>
                                  <strong>TTL:</strong>{" "}
                                  {tenant.registration.picPlaceOfBirth},{" "}
                                  {new Date(
                                    tenant.registration.picDateOfBirth
                                  ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                                <p>
                                  <strong>Gender:</strong>{" "}
                                  {tenant.registration.picGender === "MALE"
                                    ? "Laki-laki"
                                    : "Perempuan"}
                                </p>
                                <p>
                                  <strong>Pekerjaan:</strong>{" "}
                                  {tenant.registration.picOccupation}
                                </p>
                                <p>
                                  <strong>Alamat PIC:</strong>{" "}
                                  {tenant.registration.picAddress}
                                </p>
                              </div>

                              {/* Kolom 2: Info Koperasi */}
                              <div className="space-y-2">
                                <h5 className="font-semibold text-gray-700 border-b pb-1 mb-2">
                                  Informasi Koperasi
                                </h5>
                                <p>
                                  <strong>Nama:</strong>{" "}
                                  {tenant.registration.cooperativeName}
                                </p>
                                <p>
                                  <strong>SK AHU:</strong>{" "}
                                  {tenant.registration.skAhuKoperasi || "-"}
                                </p>
                                <p>
                                  <strong>Alamat:</strong>{" "}
                                  {`${tenant.registration.alamatLengkap}, ${tenant.registration.village}, ${tenant.registration.district}, ${tenant.registration.city}, ${tenant.registration.province}`}
                                </p>
                              </div>

                              {/* Kolom 3: Dokumen */}
                              <div className="space-y-2">
                                <h5 className="font-semibold text-gray-700 border-b pb-1 mb-2">
                                  Dokumen
                                </h5>
                                <ul className="space-y-2">
                                  <li>
                                    {renderLink(
                                      tenant.registration
                                        .dokPengesahanPendirian,
                                      "Pengesahan Pendirian"
                                    )}
                                  </li>
                                  <li>
                                    {renderLink(
                                      tenant.registration.dokDaftarUmum,
                                      "Daftar Umum"
                                    )}
                                  </li>
                                  <li>
                                    {renderLink(
                                      tenant.registration.dokAkteNotaris,
                                      "Akte Notaris"
                                    )}
                                  </li>
                                  <li>
                                    {renderLink(
                                      tenant.registration.dokNpwpKoperasi,
                                      "NPWP Koperasi"
                                    )}
                                  </li>
                                  <li>
                                    {renderLink(
                                      tenant.registration.petaLokasi,
                                      "Peta Lokasi"
                                    )}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal untuk Penolakan */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Tolak Pendaftaran</h3>
            <p className="mb-4 text-sm text-gray-600">
              Harap masukkan alasan penolakan. Alasan ini akan dikirimkan ke
              email PIC.
            </p>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              placeholder="Contoh: Dokumen pendaftaran tidak lengkap..."
            ></textarea>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeRejectModal}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Tolak Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
