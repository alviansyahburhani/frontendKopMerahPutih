// frontend/app/dashboard/admin/persetujuan-anggota/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { adminService, PendingRegistration } from '@/services/admin.service';
import AdminPageHeader from '@/components/AdminPageHeader';
import Button from '@/components/Button';
import { ApiErrorResponse } from '@/types/api.types';
import { Gender } from '@/types/enums';
import { Eye, XCircle, CheckCircle, Search, Inbox, UserCheck, UserX } from 'lucide-react'; // Impor ikon baru
import clsx from 'clsx';
import Link from 'next/link'; // Impor Link

// ===================================================================
// KOMPONEN MODAL DETAIL REGISTRASI (Sama seperti sebelumnya)
// ===================================================================
const DetailRegistrasiModal = ({
  registration,
  onClose,
  onApprove,
  onReject,
}: {
  registration: PendingRegistration;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  const details = [
    { label: 'Nama Lengkap', value: registration.fullName },
    { label: 'NIK', value: registration.nik },
    { label: 'Email', value: registration.email },
    { label: 'No. Telepon', value: registration.phoneNumber },
    { label: 'Jenis Kelamin', value: registration.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan' },
    { label: 'Tempat Lahir', value: registration.placeOfBirth },
    { label: 'Tanggal Lahir', value: new Date(registration.dateOfBirth).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) },
    { label: 'Pekerjaan', value: registration.occupation },
    { label: 'Alamat', value: registration.address },
    { label: 'Tanggal Daftar', value: new Date(registration.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Detail Pendaftaran Anggota</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {details.map(item => (
              <div key={item.label}>
                <dt className="text-gray-500">{item.label}</dt>
                <dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose}>Tutup</Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => onReject(registration.id)}
          >
            Tolak Pendaftaran
          </Button>
          <Button
            variant="primary"
            onClick={() => onApprove(registration.id)}
          >
            Setujui Pendaftaran
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL TOLAK REGISTRASI (Sama seperti sebelumnya)
// ===================================================================
const TolakRegistrasiModal = ({
  registration,
  onClose,
  onConfirmReject,
}: {
  registration: PendingRegistration;
  onClose: () => void;
  onConfirmReject: (id: string, reason: string) => void;
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Alasan penolakan wajib diisi.');
      return;
    }
    setError(null);
    onConfirmReject(registration.id, reason);
  };

  useEffect(() => {
    setReason('');
    setError(null);
  }, [registration]);

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Tolak Pendaftaran: {registration.fullName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={20} /></button>
        </div>
        <div className="p-6 space-y-3">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Alasan Penolakan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError(null);
            }}
            className={clsx(
              "w-full p-2 border rounded-md focus:outline-none focus:ring-2",
              error ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-brand-red-300"
            )}
            placeholder="Jelaskan mengapa pendaftaran ini ditolak..."
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            onClick={handleConfirm}
          >
            Konfirmasi Penolakan
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// --- BARU: KOMPONEN KARTU STATISTIK ---
// ===================================================================
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) => (
  <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-full bg-${color}-100`}>
      <Icon className={`h-6 w-6 text-${color}-600`} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// ===================================================================
// --- KOMPONEN SKELETON LOADING ---
// ===================================================================
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
);

const PersetujuanAnggotaSkeleton = () => (
  <div>
    <div className="mb-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mt-2" />
    </div>

    {/* Skeleton Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center gap-4">
        <Skeleton className="p-3 rounded-full w-12 h-12" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center gap-4">
        <Skeleton className="p-3 rounded-full w-12 h-12" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center gap-4">
        <Skeleton className="p-3 rounded-full w-12 h-12" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <Skeleton className="h-6 w-1/2 mx-auto text-center" />
        <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <Skeleton className="h-6 w-40" />
          <div className="relative w-full md:w-auto md:max-w-xs"><Skeleton className="w-full h-10 rounded-lg" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead className="border-b bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th>
                <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b text-sm hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-4"><Skeleton className="h-4 w-32" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4"><Skeleton className="h-4 w-20" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function PersetujuanAnggotaPage() {
  const [pendingList, setPendingList] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistrationDetail, setSelectedRegistrationDetail] = useState<PendingRegistration | null>(null);
  const [registrationToReject, setRegistrationToReject] = useState<PendingRegistration | null>(null);

  // --- BARU: State untuk Statistik (Mock Data) ---
  const [stats, setStats] = useState<{ approvedThisMonth: number; rejectedThisMonth: number }>({
    approvedThisMonth: 0, // Ganti dengan data asli nanti
    rejectedThisMonth: 0, // Ganti dengan data asli nanti
  });

  // Fungsi untuk memuat data (termasuk statistik nanti)
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPendingRegistrations();
      setPendingList(data);
      // TODO: Fetch statistik dari backend di sini dan set state `stats`
      // Contoh mock:
      setStats({ approvedThisMonth: 5, rejectedThisMonth: 1 });
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const errorMessage = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      setError(errorMessage);
      toast.error(`Gagal memuat data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredList = useMemo(() => {
    if (!searchTerm) return pendingList;
    return pendingList.filter(req =>
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.nik.includes(searchTerm) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingList, searchTerm]);

  // Handler approve (sama)
  const handleApprove = async (id: string) => {
    if (selectedRegistrationDetail?.id === id) {
      setSelectedRegistrationDetail(null);
    }
    const toastId = toast.loading('Memproses persetujuan...');
    try {
      await adminService.approveRegistration(id);
      toast.success('Anggota berhasil disetujui.', { id: toastId });
      loadData();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const errorMessage = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal: ${errorMessage}`, { id: toastId });
    }
  };

  // Handler buka modal reject (sama)
  const handleOpenRejectModal = (id: string) => {
    const registration = pendingList.find(r => r.id === id);
    if (registration) {
      setSelectedRegistrationDetail(null);
      setRegistrationToReject(registration);
    }
  };

  // Handler konfirmasi reject (sama)
  const handleConfirmReject = async (id: string, reason: string) => {
    setRegistrationToReject(null);
    const toastId = toast.loading('Memproses penolakan...');
    try {
      await adminService.rejectRegistration(id, reason);
      toast.success('Pendaftaran berhasil ditolak.', { id: toastId });
      loadData();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const errorMessage = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal: ${errorMessage}`, { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      {/* Show skeleton only on initial load when pendingList is empty */}
      {(loading && pendingList.length === 0) ? (
        <PersetujuanAnggotaSkeleton />
      ) : (
        <>
          <AdminPageHeader
            title="Persetujuan Anggota Baru"
            description="Verifikasi dan proses permohonan pendaftaran anggota baru."
          />

          {/* --- BARU: Area Statistik --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Menunggu Persetujuan" value={pendingList.length} icon={Inbox} color="yellow" />
            <StatCard title="Disetujui Bulan Ini" value={stats.approvedThisMonth} icon={UserCheck} color="green" />
            <StatCard title="Ditolak Bulan Ini" value={stats.rejectedThisMonth} icon={UserX} color="red" />
          </div>
          {/* --- Akhir Area Statistik --- */}


          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h2 className="text-lg font-bold text-gray-700">Daftar Pendaftar</h2>
                {/* Area Pencarian */}
                <div className="relative w-full md:w-auto md:max-w-xs">
                  <input
                    type="text"
                    placeholder="Cari nama, NIK, email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Status Loading dan Error */}
              {loading && pendingList.length > 0 && <p className="text-center py-8 text-gray-500">Memuat data pendaftar...</p>}
              {error && <p className="text-center py-8 text-red-500">Error: {error}</p>}

              {/* Tabel atau Empty State */}
              {!loading && !error && (
                <div className="overflow-x-auto">
                  {filteredList.length === 0 ? (
                    // --- BARU: Empty State Ditingkatkan ---
                    <div className="text-center py-12 px-6">
                      <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-semibold text-gray-800">
                        {pendingList.length === 0 ? "Tidak Ada Pendaftaran Baru" : "Pendaftar Tidak Ditemukan"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {pendingList.length === 0
                          ? "Saat ini tidak ada anggota baru yang menunggu persetujuan."
                          : "Tidak ada pendaftar yang cocok dengan kata kunci pencarian Anda."}
                      </p>
                       {/* --- BARU: Tautan Cepat --- */}
                      {pendingList.length === 0 && (
                         <div className="mt-6">
                           <Link href="/dashboard/admin/daftar-anggota">
                              <Button variant="outline">
                                 Lihat Daftar Anggota Aktif
                               </Button>
                           </Link>
                         </div>
                       )}
                    </div>
                    // --- Akhir Empty State ---
                  ) : (
                    <table className="min-w-full w-full text-left">
                      <thead className="border-b bg-gray-50 text-sm text-gray-600">
                        <tr>
                          <th className="p-4 font-medium">Nama Lengkap</th>
                          <th className="p-4 font-medium">NIK</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Tanggal Daftar</th>
                          <th className="p-4 font-medium text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredList.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 text-sm">
                            <td className="p-4">{req.fullName}</td>
                            <td className="p-4 font-mono">{req.nik}</td>
                            <td className="p-4">{req.email}</td>
                            <td className="p-4">{new Date(req.createdAt).toLocaleDateString('id-ID')}</td>
                            <td className="p-4 text-center space-x-1">
                              <button
                                onClick={() => setSelectedRegistrationDetail(req)}
                                className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition"
                                title="Lihat Detail Pendaftar"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition"
                                title="Setujui Pendaftaran"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(req.id)}
                                className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition"
                                title="Tolak Pendaftaran"
                              >
                                <XCircle size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tampilkan Modal Detail jika ada */}
      {selectedRegistrationDetail && (
        <DetailRegistrasiModal
          registration={selectedRegistrationDetail}
          onClose={() => setSelectedRegistrationDetail(null)}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
        />
      )}

      {/* Tampilkan Modal Tolak jika ada */}
      {registrationToReject && (
        <TolakRegistrasiModal
          registration={registrationToReject}
          onClose={() => setRegistrationToReject(null)}
          onConfirmReject={handleConfirmReject}
        />
      )}
    </>
  );
}