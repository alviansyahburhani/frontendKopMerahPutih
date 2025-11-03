// BUAT FILE BARU:
// frontendKopMerahPutih-loginsuperadmin/components/TenantDetailModal.tsx

import React from 'react';
import { Tenant } from '@/types/api.types';
import { FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface Props {
  tenant: Tenant | null;
  onClose: () => void;
}

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

// Helper untuk format tanggal
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function TenantDetailModal({ tenant, onClose }: Props) {
  if (!tenant || !tenant.registration) {
    // Tampilkan detail minimal jika data registrasi tidak ada (tenant lama)
    if (!tenant) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            <FiX size={24} />
          </button>
          <h3 className="text-xl font-semibold mb-4">Detail Koperasi</h3>
          <p><strong>Nama:</strong> {tenant.name}</p>
          <p><strong>Subdomain:</strong> {tenant.subdomain}</p>
          <p><strong>Status:</strong> {tenant.status}</p>
          <p className="mt-4 italic text-gray-500">
            (Data registrasi lengkap tidak ditemukan. Ini mungkin tenant yang dibuat secara manual.)
          </p>
        </div>
      </div>
    );
  }

  // Tampilan lengkap jika data registrasi ada
  const { registration: reg } = tenant;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={24} />
        </button>
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          Detail Koperasi: {reg.cooperativeName}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Kolom 1: Info PIC */}
          <div className="space-y-2">
            <h5 className="font-semibold text-gray-700 border-b pb-1 mb-2">
              Informasi PIC
            </h5>
            <p><strong>Nama:</strong> {reg.picFullName}</p>
            <p><strong>Email:</strong> {reg.email}</p>
            <p><strong>No. HP:</strong> {reg.picPhoneNumber}</p>
            <p><strong>NIK:</strong> {reg.picNik}</p>
            <p>
              <strong>TTL:</strong> {reg.picPlaceOfBirth},{' '}
              {formatDate(reg.picDateOfBirth)}
            </p>
            <p>
              <strong>Gender:</strong>{' '}
              {reg.picGender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
            </p>
            <p><strong>Pekerjaan:</strong> {reg.picOccupation}</p>
            <p><strong>Alamat PIC:</strong> {reg.picAddress}</p>
          </div>

          {/* Kolom 2: Info Koperasi */}
          <div className="space-y-2">
            <h5 className="font-semibold text-gray-700 border-b pb-1 mb-2">
              Informasi Koperasi
            </h5>
            <p><strong>Nama:</strong> {reg.cooperativeName}</p>
            <p><strong>Subdomain:</strong> {tenant.subdomain}</p>
            <p><strong>Status:</strong> {tenant.status}</p>
            <p><strong>SK AHU:</strong> {reg.skAhuKoperasi || '-'}</p>
            <p>
              <strong>Alamat:</strong>{' '}
              {`${reg.alamatLengkap}, ${reg.village}, ${reg.district}, ${reg.city}, ${reg.province}`}
            </p>
            <p>
              <strong>Tgl. Daftar:</strong> {formatDate(tenant.createdAt)}
            </p>
          </div>

          {/* Kolom 3: Dokumen */}
          <div className="space-y-2">
            <h5 className="font-semibold text-gray-700 border-b pb-1 mb-2">
              Dokumen
            </h5>
            <ul className="space-y-2">
              <li>{renderLink(reg.dokPengesahanPendirian, 'Pengesahan Pendirian')}</li>
              <li>{renderLink(reg.dokDaftarUmum, 'Daftar Umum')}</li>
              <li>{renderLink(reg.dokAkteNotaris, 'Akte Notaris')}</li>
              <li>{renderLink(reg.dokNpwpKoperasi, 'NPWP Koperasi')}</li>
              <li>{renderLink(reg.petaLokasi, 'Peta Lokasi')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}