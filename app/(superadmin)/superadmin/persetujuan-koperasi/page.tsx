// Lokasi: frontend/app/superadmin/persetujuan-koperasi/page.tsx
"use client";

import { useEffect, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { superAdminService, PendingTenant } from '@/services/superadmin.service';
import AdminPageHeader from "@/components/AdminPageHeader"; // Atau SuperAdminPageHeader
import Button from "@/components/Button";
import { ApiErrorResponse } from "@/types/api.types";
import { CheckCircle, XCircle, Search, Eye, FileText, Inbox, Clock, UserCheck, UserX } from "lucide-react"; // Impor ikon baru
import clsx from 'clsx';
import Link from 'next/link'; // Impor Link jika perlu

// ===================================================================
// KOMPONEN MODAL DETAIL KOPERASI (Pastikan field sesuai PendingTenant)
// ===================================================================
const DetailKoperasiModal = ({
    koperasi,
    onClose,
    onApprove,
    onReject,
}: {
    koperasi: PendingTenant;
    onClose: () => void;
    onApprove: (id: string, name: string) => void;
    onReject: (tenant: PendingTenant) => void;
}) => {
    // Sesuaikan field berdasarkan interface PendingTenant di superadmin.service.ts
    const infoKoperasi = [
        { label: "Nama Koperasi", value: koperasi.name },
        { label: "Subdomain Diajukan", value: koperasi.subdomain },
        { label: "Tanggal Daftar", value: new Date(koperasi.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) },
        { label: "Status Saat Ini", value: koperasi.status },
    ];
    // Contoh asumsi field tambahan (pastikan ada di PendingTenant jika ingin ditampilkan)
    const infoLokasi = [
        { label: "Provinsi", value: koperasi.province || "-" },
        { label: "Kabupaten/Kota", value: koperasi.city || "-" },
        // Tambahkan alamat lengkap jika ada
        // { label: "Alamat Lengkap", value: koperasi.address || "-" },
    ];
    const infoPIC = [
        { label: "Nama PIC", value: koperasi.picName || "-" },
        { label: "Email PIC", value: koperasi.picEmail || "-" },
        { label: "Telepon PIC", value: koperasi.phoneNumber || "-" },
        // Tambahkan NIK PIC, dll jika ada
    ];
    // Pastikan nama field URL dokumen ini sesuai dengan interface PendingTenant
    const dokumen = [
        { label: "Pengesahan Badan Hukum", url: koperasi.dokPengesahanPendirianUrl || null },
        { label: "Daftar Umum Koperasi", url: koperasi.dokDaftarUmumUrl || null },
        { label: "Akte Notaris Pendirian", url: koperasi.dokAkteNotarisUrl || null },
        { label: "NPWP Koperasi", url: koperasi.dokNpwpKoperasiUrl || null },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Detail Permohonan Koperasi</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Info Koperasi */}
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Koperasi</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            {infoKoperasi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 break-words">{item.value}</dd></div>))}
                        </dl>
                    </div>
                    {/* Info Lokasi */}
                    {infoLokasi.some(i => i.value !== '-') && (
                         <div className="border-b pb-4">
                            <h3 className="font-semibold text-brand-red-600 mb-2">Lokasi</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {infoLokasi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 break-words">{item.value}</dd></div>))}
                            </dl>
                        </div>
                    )}
                    {/* Info PIC */}
                     {infoPIC.some(i => i.value !== '-') && (
                        <div className="border-b pb-4">
                            <h3 className="font-semibold text-brand-red-600 mb-2">Penanggung Jawab (PIC)</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {infoPIC.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 break-words">{item.value}</dd></div>))}
                            </dl>
                        </div>
                    )}
                    {/* Dokumen */}
                    <div>
                        <h3 className="font-semibold text-brand-red-600 mb-2">Dokumen Pendukung</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {dokumen.map(doc => (
                                <div key={doc.label}>
                                    <p className="text-sm text-gray-500">{doc.label}</p>
                                    {doc.url ? (
                                        // Pastikan URL valid
                                        <a href={doc.url.startsWith('http') ? doc.url : `http://${doc.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium">
                                            <FileText size={14} /> Lihat Dokumen
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Tidak diunggah</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Footer Modal */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <Button type="button" variant="outline" onClick={onClose}>Tutup</Button>
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => onReject(koperasi)}
                    >
                        <XCircle size={18} className="mr-1"/> Tolak
                    </Button>
                    <Button
                        variant="primary"
                        className="bg-green-600 hover:bg-green-700 focus:ring-green-500" // Warna hijau
                        onClick={() => onApprove(koperasi.id, koperasi.name)}
                    >
                         <CheckCircle size={18} className="mr-1"/> Setujui
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL TOLAK TENANT (Sama)
// ===================================================================
const TolakTenantModal = ({ /* ... (kode modal tolak sama) ... */
  tenant,
  onClose,
  onConfirmReject,
}: {
  tenant: PendingTenant;
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
    onConfirmReject(tenant.id, reason);
  };

  useEffect(() => {
    setReason('');
    setError(null);
  }, [tenant]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Tolak Koperasi: {tenant.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={20} /></button>
        </div>
        <div className="p-6 space-y-3">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Alasan Penolakan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason" name="reason" rows={4} value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError(null);
            }}
            className={clsx( "w-full p-2 border rounded-md focus:outline-none focus:ring-2", error ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-brand-red-300" )}
            placeholder="Jelaskan mengapa pendaftaran koperasi ini ditolak..."
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500" onClick={handleConfirm} > Konfirmasi Penolakan </Button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN KARTU STATISTIK (Sama seperti sebelumnya)
// ===================================================================
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number | string, icon: React.ElementType, color: string }) => (
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
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function PersetujuanKoperasiPage() {
    const [pendingList, setPendingList] = useState<PendingTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // State error di-inisialisasi null
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedKoperasi, setSelectedKoperasi] = useState<PendingTenant | null>(null);
    const [tenantToReject, setTenantToReject] = useState<PendingTenant | null>(null);

    // State Statistik (Gunakan data mock atau fetch dari API nanti)
    const [stats, setStats] = useState<{ pending: number | string; approved: number | string; rejected: number | string }>({
        pending: '...',
        approved: '...',
        rejected: '...',
    });

    // Load Data
    const loadData = async () => {
        setLoading(true);
        setError(null); // Reset error setiap kali load
        try {
            const data = await superAdminService.getPendingTenants();
            setPendingList(data);
            // Update statistik pending count
            setStats(prev => ({ ...prev, pending: data.length }));
            // TODO: Fetch data statistik approved/rejected jika ada endpointnya
            // setStats({ pending: data.length, approved: 15, rejected: 2 }); // Contoh
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            // Tangkap pesan error spesifik dari backend
            const message = apiError.message || 'Terjadi kesalahan tidak diketahui.';
            // Tampilkan error di UI
            setError(`Gagal memuat data koperasi pending: ${Array.isArray(message) ? message.join(', ') : message}`);
            // Jangan tampilkan toast error di sini jika sudah ditampilkan di UI
            // toast.error(`Gagal memuat data: ${Array.isArray(message) ? message.join(', ') : message}`);
            console.error("Fetch error:", err); // Tetap log error asli
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter data
    const filteredKoperasi = useMemo(() => {
         if (!searchTerm) return pendingList;
        return pendingList.filter(tenant =>
            tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tenant.picName && tenant.picName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tenant.picEmail && tenant.picEmail.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [pendingList, searchTerm]);

    // Handler Approve
    const handleApprove = async (id: string, name: string) => { /* ... (sama) ... */
         if (!window.confirm(`Apakah Anda yakin ingin MENYETUJUI pendaftaran koperasi "${name}"?`)) {
            return;
        }
        setSelectedKoperasi(null);
        const toastId = toast.loading(`Menyetujui ${name}...`);
        try {
            await superAdminService.approveTenant(id);
            toast.success(`Koperasi "${name}" berhasil disetujui.`, { id: toastId });
            loadData();
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            toast.error(`Gagal menyetujui: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`, { id: toastId });
            console.error("Approve error:", err);
        }
    };

    // Handler Buka Modal Reject
    const handleOpenRejectModal = (tenant: PendingTenant) => { /* ... (sama) ... */
         setSelectedKoperasi(null);
        setTenantToReject(tenant);
    };

    // Handler Konfirmasi Reject
    const handleConfirmReject = async (id: string, reason: string) => { /* ... (sama) ... */
        setTenantToReject(null);
        const tenantName = pendingList.find(t => t.id === id)?.name || `ID ${id}`;
        const toastId = toast.loading(`Menolak ${tenantName}...`);
        try {
            await superAdminService.rejectTenant(id, reason);
            toast.success(`Pendaftaran koperasi "${tenantName}" berhasil ditolak.`, { id: toastId });
            loadData();
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            toast.error(`Gagal menolak: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`, { id: toastId });
            console.error("Reject error:", err);
        }
    };

    // Skeleton
    const Skeleton = ({ className = "" }: { className?: string }) => ( /* ... (sama) ... */
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );
    const PageSkeleton = () => ( /* ... (sama) ... */
         <div>
            <div className="mb-8"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-2" /></div>
            {/* Skeleton Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">{[...Array(3)].map((_, i)=>(<Skeleton key={i} className="h-24 rounded-lg"/>))}</div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4"><Skeleton className="h-6 w-40" /><div className="relative w-full max-w-xs"><Skeleton className="w-full h-10 rounded-lg" /></div></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600"><tr><th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-28" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th></tr></thead>
                            <tbody>{[...Array(3)].map((_, i)=>(<tr key={i} className="border-b"><td className="p-4"><Skeleton className="h-4 w-40" /></td><td className="p-4"><Skeleton className="h-4 w-20" /></td><td className="p-4"><Skeleton className="h-4 w-28" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // Tampilkan Skeleton jika loading
    if (loading && !error) { // Hanya tampilkan skeleton jika benar-benar loading tanpa error awal
        return <PageSkeleton />;
    }

    return (
        <div>
            <Toaster position="top-right" />
            <AdminPageHeader
                title="Persetujuan Koperasi Baru"
                description="Tinjau detail dan berkas permohonan pendaftaran koperasi baru."
            />

            {/* --- Area Statistik --- */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Menunggu Persetujuan" value={stats.pending} icon={Clock} color="yellow" />
                <StatCard title="Disetujui (Bulan Ini)" value={stats.approved} icon={UserCheck} color="green" />
                <StatCard title="Ditolak (Bulan Ini)" value={stats.rejected} icon={UserX} color="red" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <h2 className="text-lg font-bold text-gray-700">Daftar Permohonan</h2>
                        {/* Area Pencarian */}
                        <div className="relative w-full md:w-auto md:max-w-xs">
                            <input
                                type="text"
                                placeholder="Cari nama koperasi, PIC..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading} // Disable saat loading
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* --- Tampilkan Error di sini --- */}
                    {error && (
                        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Tabel atau Empty State */}
                    {!loading && !error && ( // Hanya render tabel/empty state jika tidak loading DAN tidak ada error
                        <div className="overflow-x-auto">
                            {filteredKoperasi.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-semibold text-gray-800">
                                        {pendingList.length === 0 ? "Tidak Ada Permohonan Baru" : "Koperasi Tidak Ditemukan"}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {pendingList.length === 0
                                            ? "Saat ini tidak ada pendaftaran koperasi yang menunggu persetujuan."
                                            : "Tidak ada koperasi pending yang cocok dengan kata kunci pencarian Anda."}
                                    </p>
                                     {/* Tambahkan link ke daftar tenant aktif jika perlu */}
                                     {/* <div className="mt-4"> <Link href="/superadmin/tenants"> <Button variant="outline">Lihat Semua Koperasi</Button> </Link> </div> */}
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[700px]"> {/* Tambah min-w-* agar tidak terlalu sempit */}
                                    <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                        <tr>
                                            <th className="p-4 font-medium">Nama Koperasi</th>
                                            {/* Kolom PIC ditambahkan */}
                                            <th className="p-4 font-medium">PIC Pendaftar</th>
                                            <th className="p-4 font-medium">Lokasi</th>
                                            <th className="p-4 font-medium">Tanggal Daftar</th>
                                            <th className="p-4 font-medium text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredKoperasi.map((calon) => (
                                            <tr key={calon.id} className="border-b hover:bg-gray-50 text-sm">
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-800">{calon.name}</p>
                                                    <p className="text-xs text-blue-600 font-mono">{calon.subdomain}</p>
                                                </td>
                                                {/* Tampilkan PIC */}
                                                <td className="p-4">
                                                    <p>{calon.picName || '-'}</p>
                                                    <p className="text-xs text-gray-500">{calon.picEmail || '-'}</p>
                                                </td>
                                                {/* Tampilkan Lokasi */}
                                                <td className="p-4">
                                                    <p>{calon.city || '-'}</p>
                                                    <p className="text-xs text-gray-500">{calon.province || '-'}</p>
                                                </td>
                                                <td className="p-4">{new Date(calon.createdAt).toLocaleDateString('id-ID')}</td>
                                                <td className="p-4 text-center space-x-1">
                                                    <button onClick={() => setSelectedKoperasi(calon)} className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition" title="Lihat Detail & Berkas" > <Eye size={18} /> </button>
                                                    <button onClick={() => handleApprove(calon.id, calon.name)} className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition" title="Setujui Pendaftaran" > <CheckCircle size={18} /> </button>
                                                    <button onClick={() => handleOpenRejectModal(calon)} className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition" title="Tolak Pendaftaran" > <XCircle size={18} /> </button>
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

            {/* Modal Detail Koperasi */}
            {selectedKoperasi && ( <DetailKoperasiModal koperasi={selectedKoperasi} onClose={() => setSelectedKoperasi(null)} onApprove={handleApprove} onReject={handleOpenRejectModal} /> )}
            {/* Modal Tolak Koperasi */}
            {tenantToReject && ( <TolakTenantModal tenant={tenantToReject} onClose={() => setTenantToReject(null)} onConfirmReject={handleConfirmReject} /> )}
        </div>
    );
}

// Pastikan PendingTenant diimpor ATAU didefinisikan di sini jika perlu
// interface PendingTenant {
//     id: string; name: string; subdomain: string; createdAt: string; picName?: string; picEmail?: string; city?: string; province?: string; phoneNumber?: string;
//     dokPengesahanPendirianUrl?: string | null; dokDaftarUmumUrl?: string | null; dokAkteNotarisUrl?: string | null; dokNpwpKoperasiUrl?: string | null;
//     status: 'PENDING';
// }