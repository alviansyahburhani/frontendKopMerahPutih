// frontend/app/dashboard/admin/daftar-karyawan/page.tsx
"use client";

import { useState, useMemo, FormEvent, useEffect, useCallback, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, Edit, Trash2, XCircle } from "lucide-react"; // Impor ikon
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
// --- Impor service & tipe baru ---
import { adminService, Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/services/admin.service';
import { ApiErrorResponse, JwtPayload } from "@/types/api.types";
import { authService } from "@/services/auth.service";
import { Gender } from "@/types/enums"; // Mungkin perlu untuk Detail

// --- DATABASE ANGGOTA (SIMULASI UNTUK PENCARIAN DI MODAL TAMBAH) ---
// Idealnya, ini diganti dengan API search member
const mockAnggotaDB = [
    { id: 'agt001', nama: 'Alviansyah Burhani', nik: '3201...', pekerjaan: 'Wiraswasta', alamat: 'Jl. Merdeka...' },
    { id: 'agt002', nama: 'Budi Santoso', nik: '3202...', pekerjaan: 'Karyawan Swasta', alamat: 'Jl. Veteran...' },
    // ... tambahkan anggota lain jika perlu
];

// ===================================================================
// KOMPONEN MODAL TAMBAH KARYAWAN
// ===================================================================
const TambahKaryawanModal = ({ isOpen, onClose, onKaryawanAdded }: {
    isOpen: boolean;
    onClose: () => void;
    onKaryawanAdded: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<CreateEmployeeDto, 'memberId'>>({
        jabatan: '',
        tanggalDiangkat: new Date().toISOString().split('T')[0],
    });

    // State & logika pencarian anggota (sama seperti TambahPengurusModal)
    const [searchAnggotaTerm, setSearchAnggotaTerm] = useState('');
    const [searchAnggotaResults, setSearchAnggotaResults] = useState<typeof mockAnggotaDB>([]);
    const [selectedAnggota, setSelectedAnggota] = useState<(typeof mockAnggotaDB[0]) | null>(null);
    const [anggotaNotFound, setAnggotaNotFound] = useState(false);

    useEffect(() => { /* ... (logika debounce search anggota sama) ... */
         if (!searchAnggotaTerm || selectedAnggota) { setSearchAnggotaResults([]); setAnggotaNotFound(false); return; }
        const handler = setTimeout(() => {
            const hasil = mockAnggotaDB.filter(anggota => anggota.nama.toLowerCase().includes(searchAnggotaTerm.toLowerCase()) || anggota.nik.includes(searchAnggotaTerm));
            setSearchAnggotaResults(hasil); setAnggotaNotFound(hasil.length === 0 && searchAnggotaTerm !== '');
        }, 300);
        return () => clearTimeout(handler);
    }, [searchAnggotaTerm, selectedAnggota]);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleAnggotaSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchAnggotaTerm(e.target.value); setSelectedAnggota(null);
    };
    const handleSelectAnggota = (anggota: typeof mockAnggotaDB[0]) => {
        setSelectedAnggota(anggota); setSearchAnggotaTerm(anggota.nama); setSearchAnggotaResults([]);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedAnggota) { toast.error("Pilih anggota yang akan dijadikan karyawan."); return; }
        setLoading(true);

        const dto: CreateEmployeeDto = { ...formData, memberId: selectedAnggota.id };
        const promise = adminService.createEmployee(dto);

        toast.promise(promise, {
            loading: 'Menyimpan karyawan baru...',
            success: (result) => {
                setLoading(false); onKaryawanAdded(); onClose();
                return `Karyawan "${selectedAnggota.nama}" (${result.jabatan}) berhasil ditambahkan!`;
            },
            error: (err) => {
                setLoading(false); const apiError = err as ApiErrorResponse;
                return `Gagal: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
            }
        });
    };

    useEffect(() => { /* ... (reset form saat isOpen berubah) ... */
        if (isOpen) {
             setFormData({ jabatan: '', tanggalDiangkat: new Date().toISOString().split('T')[0] });
             setSearchAnggotaTerm(''); setSelectedAnggota(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Tambah Karyawan Baru</h2><button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button></div>
                    <div className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
                         {/* Pencarian Anggota */}
                         <div className="relative">
                            <label htmlFor="searchAnggota" className="block text-sm font-medium text-gray-700">Pilih Anggota*</label>
                            <input type="text" id="searchAnggota" required placeholder="Ketik nama atau NIK anggota..." value={searchAnggotaTerm} onChange={handleAnggotaSearchChange} className="mt-1 w-full p-2 border rounded-lg" autoComplete="off" disabled={loading} />
                            {searchAnggotaResults.length > 0 && ( <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">{searchAnggotaResults.map(anggota => ( <div key={anggota.id} onClick={() => handleSelectAnggota(anggota)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{anggota.nama} ({anggota.nik})</div> ))}</div> )}
                            {anggotaNotFound && <p className="text-xs text-red-500 mt-1">Anggota tidak ditemukan.</p>}
                            {selectedAnggota && <p className="text-xs text-green-600 mt-1">Anggota dipilih: {selectedAnggota.nama}</p>}
                        </div>
                        {/* Jabatan & Tanggal Angkat */}
                        <div><label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan*</label><input type="text" name="jabatan" id="jabatan" required value={formData.jabatan} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                        <div><label htmlFor="tanggalDiangkat" className="block text-sm font-medium text-gray-700">Tanggal Diangkat*</label><input type="date" name="tanggalDiangkat" id="tanggalDiangkat" required value={formData.tanggalDiangkat} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                        {/* Tambah field lain jika perlu */}
                    </div>
                    <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button><Button type="submit" disabled={loading || !selectedAnggota}>{loading ? 'Menyimpan...' : 'Simpan Karyawan'}</Button></div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL EDIT KARYAWAN
// ===================================================================
const EditKaryawanModal = ({ isOpen, karyawan, onClose, onKaryawanUpdated }: {
    isOpen: boolean;
    karyawan: Employee | null;
    onClose: () => void;
    onKaryawanUpdated: () => void;
}) => {
    const [formData, setFormData] = useState<Partial<UpdateEmployeeDto>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (karyawan) {
            setFormData({
                jabatan: karyawan.jabatan,
                tanggalDiangkat: karyawan.tanggalDiangkat ? new Date(karyawan.tanggalDiangkat).toISOString().split('T')[0] : '',
                tanggalBerhenti: karyawan.tanggalBerhenti ? new Date(karyawan.tanggalBerhenti).toISOString().split('T')[0] : null,
                alasanBerhenti: karyawan.alasanBerhenti || null,
            });
        } else {
            setFormData({});
        }
    }, [karyawan]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
         if (name === 'tanggalBerhenti' && value === '') {
            setFormData(prev => ({ ...prev, [name]: null, alasanBerhenti: null }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!karyawan) return;
        setLoading(true);

        // Pastikan tanggal berhenti null jika tidak diisi
        const dto: UpdateEmployeeDto = {
            ...formData,
            tanggalBerhenti: formData.tanggalBerhenti || null,
            alasanBerhenti: formData.tanggalBerhenti ? (formData.alasanBerhenti || '') : null,
        };

        const promise = adminService.updateEmployee(karyawan.id, dto);

        toast.promise(promise, {
            loading: 'Memperbarui data karyawan...',
            success: (result) => {
                setLoading(false); onKaryawanUpdated(); onClose();
                return `Data karyawan "${karyawan.member.fullName}" berhasil diperbarui!`;
            },
            error: (err) => {
                setLoading(false); const apiError = err as ApiErrorResponse;
                return `Gagal: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
            }
        });
    };

     if (!isOpen || !karyawan) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Edit Data Karyawan</h2><button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button></div>
                    <div className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
                        <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">Anda mengedit data untuk: <strong className="text-blue-800">{karyawan.member.fullName}</strong></p>
                        <div><label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan*</label><input type="text" name="jabatan" id="jabatan" required value={formData.jabatan || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                        <div><label htmlFor="tanggalDiangkat" className="block text-sm font-medium text-gray-700">Tanggal Diangkat*</label><input type="date" name="tanggalDiangkat" id="tanggalDiangkat" required value={formData.tanggalDiangkat || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                        <div className="border-t pt-4 space-y-4">
                             <h3 className="text-sm font-medium text-gray-600">Informasi Pemberhentian (Opsional)</h3>
                             <div><label htmlFor="tanggalBerhenti" className="block text-sm font-medium text-gray-700">Tanggal Berhenti</label><input type="date" name="tanggalBerhenti" id="tanggalBerhenti" value={formData.tanggalBerhenti || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                             {/* Hanya tampilkan alasan jika tanggal berhenti diisi */}
                             {formData.tanggalBerhenti && (
                                <div><label htmlFor="alasanBerhenti" className="block text-sm font-medium text-gray-700">Alasan Berhenti</label><textarea name="alasanBerhenti" id="alasanBerhenti" rows={2} value={formData.alasanBerhenti || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                             )}
                        </div>
                    </div>
                    <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button><Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL BERHENTIKAN KARYAWAN (Pengganti prompt)
// ===================================================================
const BerhentikanKaryawanModal = ({ isOpen, karyawan, onClose, onConfirm }: {
    isOpen: boolean;
    karyawan: Employee | null;
    onClose: () => void;
    onConfirm: (id: string, reason: string) => void; // Kirim ID dan Alasan
}) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // State loading untuk submit

    useEffect(() => {
        if (isOpen) { setReason(''); setError(null); setLoading(false); }
    }, [isOpen]);

    const handleConfirmClick = () => {
        if (!reason.trim()) { setError('Alasan pemberhentian wajib diisi.'); return; }
        setError(null);
        if (karyawan) {
             setLoading(true); // Mulai loading
             onConfirm(karyawan.id, reason); // Kirim ID dan alasan ke handler utama
             // Handler utama akan handle toast & close modal
        }
    };

    if (!isOpen || !karyawan) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-5 border-b flex justify-between items-center"><h2 className="text-lg font-bold text-gray-800">Berhentikan Karyawan</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={20} /></button></div>
                <div className="p-6 space-y-3">
                    <p className="text-sm">Anda akan memberhentikan karyawan: <strong>{karyawan.member.fullName}</strong> ({karyawan.jabatan}).</p>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Alasan Pemberhentian <span className="text-red-500">*</span></label>
                    <textarea id="reason" name="reason" rows={3} value={reason}
                        onChange={(e) => { setReason(e.target.value); if (e.target.value.trim()) setError(null); }}
                        className={clsx("w-full p-2 border rounded-md focus:outline-none focus:ring-2", error ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-brand-red-300")}
                        placeholder="Contoh: Resign, Pensiun, Pelanggaran..." disabled={loading}
                    />
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
                    <Button variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500" onClick={handleConfirmClick} disabled={loading}>{loading ? 'Memproses...' : 'Konfirmasi Pemberhentian'}</Button>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function DaftarKaryawanPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [employeeList, setEmployeeList] = useState<Employee[]>([]); // Ganti nama state
    const [userData, setUserData] = useState<JwtPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isTambahModalOpen, setTambahModalOpen] = useState(false);
    const [karyawanToEdit, setKaryawanToEdit] = useState<Employee | null>(null);
    // State baru untuk modal berhentikan
    const [karyawanToBerhentikan, setKaryawanToBerhentikan] = useState<Employee | null>(null);

    const todayDateFormatted = useMemo(() => { /* ... (sama) ... */
       return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    }, []);

    // Load Data (Profil + Karyawan)
    const loadData = useCallback(async () => { /* ... (mirip loadData Pengurus) ... */
        setLoading(true); setError(null);
        try {
            const [profileData, employeesData] = await Promise.all([
                authService.getProfile(),
                adminService.getAllEmployees() // Panggil service karyawan
            ]);
            setUserData(profileData);
            setEmployeeList(employeesData);
            if (!profileData?.cooperativeName) { console.warn("Info koperasi belum ada di profil."); }
        } catch (err) {
            const apiError = err as ApiErrorResponse | Error;
            const message = `Gagal memuat data: ${apiError.message}`;
            setError(message); toast.error(message); console.error("Fetch error:", err);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Filter Karyawan
    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employeeList;
        return employeeList.filter(e => e.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, employeeList]);

    // Handler Berhentikan (buka modal)
    const handleOpenBerhentikanModal = (karyawan: Employee) => {
        setKaryawanToBerhentikan(karyawan);
    };

    // Handler Konfirmasi Berhentikan (dari modal)
    const handleConfirmBerhentikan = (id: string, reason: string) => {
        const karyawan = employeeList.find(e => e.id === id);
        if (!karyawan) return;

        const promise = adminService.removeEmployee(id, reason); // Panggil service remove

        toast.promise(promise, {
            loading: `Memproses pemberhentian ${karyawan.member.fullName}...`,
            success: () => {
                setKaryawanToBerhentikan(null); // Tutup modal
                loadData(); // Reload data
                return `${karyawan.member.fullName} berhasil diberhentikan.`;
            },
            error: (err) => {
                 setKaryawanToBerhentikan(null); // Tutup modal juga jika error
                const apiError = err as ApiErrorResponse;
                return `Gagal: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
            }
        });
    };


    // Callback Sukses Tambah/Update
    const handleUpdateSuccess = useCallback(() => { loadData(); }, [loadData]);

    // Skeleton
    const Skeleton = ({ className = "" }: { className?: string }) => ( /* ... */ <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />);
    const DaftarKaryawanSkeleton = () => ( /* ... (Mirip skeleton Pengurus/Anggota) ... */
        <div>
            <div className="mb-8"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-2" /></div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200"><Skeleton className="h-6 w-1/2 mx-auto text-center" /><div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm"><div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div></div></div>
                <div className="p-6"><div className="flex justify-between items-center mb-4"><div className="relative w-full max-w-sm"><Skeleton className="w-full h-10 rounded-lg" /></div><Skeleton className="h-10 w-40 ml-4" /></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="border-b bg-gray-50 text-sm text-gray-600"><tr><th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th><th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th></tr></thead><tbody>{[...Array(5)].map((_, i) => ( <tr key={i} className="border-b text-sm"><td className="p-4"><Skeleton className="h-4 w-32" /></td><td className="p-4"><Skeleton className="h-4 w-20" /></td><td className="p-4"><Skeleton className="h-4 w-16" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td><td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td></tr> ))}</tbody></table></div></div>
            </div>
        </div>
    );

    if (loading && !error) { return <DaftarKaryawanSkeleton />; }

    return (
        <div>
            <Toaster position="top-right" />
            <div className="mb-6">
                <AdminPageHeader
                    title="Buku Daftar Karyawan"
                    description="Kelola data karyawan koperasi."
                    actionButton={<Button onClick={() => setTambahModalOpen(true)}><PlusCircle size={20} /><span>Tambah Karyawan</span></Button>}
                />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                {/* Header Koperasi Dinamis */}
                <div className="p-6 border-b border-gray-200">
                     <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Karyawan</h2>
                     <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2"><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">{userData?.cooperativeName || 'Memuat...'}</span></div><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">{userData?.city || 'Memuat...'}</span></div></div>
                        <div className="space-y-2"><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">{userData?.legalNumber || 'Memuat...'}</span></div><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL</span><span className="text-gray-800 font-medium">{todayDateFormatted}</span></div></div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Search Bar */}
                     <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full max-w-sm">
                            <input type="text" placeholder="Cari nama karyawan..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading} />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Pesan Error */}
                    {error && !loading && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">{error}</div>}

                    {/* Tabel Karyawan */}
                    {!error && (
                         <div className="overflow-x-auto relative">
                             {loading && employeeList.length > 0 && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10"><p>Memperbarui...</p></div>}
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                    <tr>
                                        {/* <th className="p-4 font-medium">No.</th> */}
                                        <th className="p-4 font-medium">Nama Lengkap</th>
                                        <th className="p-4 font-medium">Jabatan</th>
                                        <th className="p-4 font-medium">Tanggal Diangkat</th>
                                        <th className="p-4 font-medium text-center">Status</th>
                                        <th className="p-4 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length === 0 && !loading ? (
                                        <tr><td colSpan={5} className="text-center p-8 text-gray-500">{employeeList.length === 0 ? "Belum ada data karyawan." : "Karyawan tidak ditemukan."}</td></tr>
                                    ) : (
                                        filteredEmployees.map((karyawan, index) => (
                                            <tr key={karyawan.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                                {/* <td className="p-4 font-medium">{index + 1}.</td> */}
                                                <td className="p-4">{karyawan.member.fullName}</td>
                                                <td className="p-4 font-semibold">{karyawan.jabatan}</td>
                                                <td className="p-4">{new Date(karyawan.tanggalDiangkat).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${!karyawan.tanggalBerhenti ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {!karyawan.tanggalBerhenti ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center space-x-1">
                                                     {/* Tombol Detail bisa ditambahkan jika perlu, mirip DetailPengurusModal */}
                                                     {/* <button className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200" title="Lihat Detail"><Eye size={18} /></button> */}
                                                     <button onClick={() => setKaryawanToEdit(karyawan)} className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200" title="Edit Karyawan"><Edit size={18} /></button>
                                                    {/* Tombol Berhentikan hanya jika aktif */}
                                                    {!karyawan.tanggalBerhenti && <button onClick={() => handleOpenBerhentikanModal(karyawan)} className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200" title="Berhentikan Karyawan"><Trash2 size={18} /></button>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Modals */}
            <TambahKaryawanModal isOpen={isTambahModalOpen} onClose={() => setTambahModalOpen(false)} onKaryawanAdded={handleUpdateSuccess} />
             <EditKaryawanModal isOpen={!!karyawanToEdit} karyawan={karyawanToEdit} onClose={() => setKaryawanToEdit(null)} onKaryawanUpdated={handleUpdateSuccess} />
             <BerhentikanKaryawanModal isOpen={!!karyawanToBerhentikan} karyawan={karyawanToBerhentikan} onClose={() => setKaryawanToBerhentikan(null)} onConfirm={handleConfirmBerhentikan} />
             {/* <DetailPengurusModal isOpen={!!pengurusToView} pengurus={pengurusToView} onClose={() => setPengurusToView(null)} /> */}
        </div>
    );
}