// Lokasi: frontend/app/dashboard/admin/notulen-rapat-anggota/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, FileText, Download, Edit, Trash2, X } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data ---
type NotulenRapat = {
    id: string;
    judul: string;
    tanggal: string; // Format YYYY-MM-DD
    agenda: string[];
    jumlahHadir: number;
    fileUrl?: string; // URL ke file PDF notulen jika ada
};

// --- Data Contoh ---
const mockNotulen: NotulenRapat[] = [
    { 
        id: 'rat001', 
        judul: 'Rapat Anggota Tahunan (RAT) 2025', 
        tanggal: '2025-03-15',
        agenda: ['Laporan Pertanggungjawaban Pengurus', 'Pembahasan Rencana Kerja 2026', 'Pemilihan Pengawas Baru'],
        jumlahHadir: 120,
        fileUrl: '#'
    },
    { 
        id: 'rat002', 
        judul: 'Rapat Anggota Luar Biasa - Perubahan AD/ART', 
        tanggal: '2024-11-20',
        agenda: ['Sosialisasi usulan perubahan Anggaran Dasar', 'Persetujuan perubahan pasal 15', 'Lain-lain'],
        jumlahHadir: 95,
        fileUrl: '#'
    },
];

// --- Tipe untuk data form ---
type NotulenFormData = Omit<NotulenRapat, 'id' | 'fileUrl' | 'agenda'> & {
    agenda: string; // Agenda di form adalah satu blok teks
};

// ===================================================================
// KOMPONEN MODAL (Untuk Tambah & Edit)
// ===================================================================
const NotulenModal = ({ isOpen, onClose, onSave, initialData, title, submitText }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NotulenFormData) => void;
    initialData: NotulenFormData;
    title: string;
    submitText: string;
}) => {
    const [formData, setFormData] = useState<NotulenFormData>(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="judul" className="block text-sm font-medium text-gray-700">Judul Rapat*</label>
                            <input type="text" id="judul" name="judul" required value={formData.judul} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal Rapat*</label>
                                <input type="date" id="tanggal" name="tanggal" required value={formData.tanggal} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="jumlahHadir" className="block text-sm font-medium text-gray-700">Jumlah Anggota Hadir*</label>
                                <input type="number" id="jumlahHadir" name="jumlahHadir" required value={formData.jumlahHadir} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">Agenda Rapat</label>
                            <textarea id="agenda" name="agenda" rows={4} value={formData.agenda} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" placeholder="Tulis setiap agenda di baris baru..." />
                            <p className="text-xs text-gray-500 mt-1">Setiap baris akan dianggap sebagai satu poin agenda.</p>
                        </div>
                         <div>
                            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">Unggah File Notulen (PDF)</label>
                            <input type="file" id="fileUpload" name="fileUpload" accept=".pdf" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{submitText}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL DETAIL NOTULEN
// ===================================================================
const DetailNotulenModal = ({ isOpen, onClose, notulen }: { isOpen: boolean; onClose: () => void; notulen: NotulenRapat | null }) => {
    if (!isOpen || !notulen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Detail Notulen</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Tanggal Rapat</p>
                        <p className="font-semibold">{new Date(notulen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Judul Rapat</p>
                        <p className="font-semibold text-lg">{notulen.judul}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Jumlah Kehadiran</p>
                        <p className="font-semibold">{notulen.jumlahHadir} orang</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Agenda yang Dibahas</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700">
                            {notulen.agenda.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                    <Button type="button" variant="primary" onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function NotulenRapatAnggotaPage() {
    const [notulenList, setNotulenList] = useState<NotulenRapat[]>([]);
    const [filters, setFilters] = useState({ search: '', tanggalMulai: '', tanggalSelesai: '' });
    const [loading, setLoading] = useState(true);
    
    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setNotulenList(mockNotulen);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // --- State untuk mengelola modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedNotulen, setSelectedNotulen] = useState<NotulenRapat | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => {
        setFilters({ search: '', tanggalMulai: '', tanggalSelesai: '' });
    };

    const filteredNotulen = useMemo(() => {
        return notulenList.filter(notulen => {
            const tanggalRapat = new Date(notulen.tanggal);
            const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
            const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
            if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
            if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);
            return (
                notulen.judul.toLowerCase().includes(filters.search.toLowerCase()) &&
                (!tanggalMulai || tanggalRapat >= tanggalMulai) &&
                (!tanggalSelesai || tanggalRapat <= tanggalSelesai)
            );
        });
    }, [notulenList, filters]);

    // Skeleton kecil
    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    const NotulenRapatAnggotaSkeleton = () => (
        <div>
            <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <Skeleton className="h-6 w-1/2 mx-auto text-center" />
                    <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <Skeleton className="h-6 w-40 mb-6" />

                    {/* Filter Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
                        <div className="grow">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="w-full h-10 rounded-lg" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-5 bg-white">
                                <div className="border-b pb-3">
                                    <Skeleton className="h-3 w-48 mb-2" />
                                    <Skeleton className="h-5 w-64 mt-1" />
                                    <Skeleton className="h-3 w-32 mt-2" />
                                </div>
                                <div className="py-4">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-5/6" />
                                        <Skeleton className="h-3 w-4/6" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Skeleton className="h-8 w-20 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <NotulenRapatAnggotaSkeleton />;
    }

    // --- Fungsi untuk membuka modal ---
    const handleOpenModal = (mode: 'add' | 'edit', notulen?: NotulenRapat) => {
        setModalMode(mode);
        setSelectedNotulen(notulen || null);
        setIsModalOpen(true);
    };
    
    // --- Fungsi untuk menyimpan data (baik tambah maupun edit) ---
    const handleSave = (data: NotulenFormData) => {
        const agendaArray = data.agenda.split('\n').filter(item => item.trim() !== '');

        if (modalMode === 'add') {
            const newNotulen: NotulenRapat = {
                id: `rat${Date.now()}`,
                ...data,
                agenda: agendaArray,
                fileUrl: '#',
            };
            setNotulenList(prev => [newNotulen, ...prev]);
            alert(`Notulen "${newNotulen.judul}" berhasil disimpan.`);
        } else if (modalMode === 'edit' && selectedNotulen) {
            const updatedNotulen: NotulenRapat = {
                ...selectedNotulen,
                ...data,
                agenda: agendaArray,
            };
            setNotulenList(prev => prev.map(n => n.id === updatedNotulen.id ? updatedNotulen : n));
            alert(`Notulen "${updatedNotulen.judul}" berhasil diperbarui.`);
        }
    };

    // --- Fungsi untuk menghapus notulen ---
    const handleDelete = (id: string, judul: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus notulen untuk "${judul}"?`)) {
            setNotulenList(prev => prev.filter(n => n.id !== id));
            alert("Notulen berhasil dihapus.");
        }
    };
    
    // --- Fungsi untuk membuka modal detail ---
    const handleLihatDetail = (notulen: NotulenRapat) => {
        setSelectedNotulen(notulen);
        setIsDetailModalOpen(true);
    };
    
    // --- Data awal untuk form tambah ---
    const initialDataForAdd: NotulenFormData = {
        judul: '',
        tanggal: new Date().toISOString().split('T')[0],
        jumlahHadir: 0,
        agenda: '',
    };

    return (
        <div>
            <AdminPageHeader
                title="Buku Notulen Rapat Anggota"
                description="Arsipkan dan kelola semua notulensi dari Rapat Anggota."
                actionButton={
                    <Button onClick={() => handleOpenModal('add')} variant="primary">
                        <PlusCircle size={20} /><span>Tambah Notulen</span>
                    </Button>
                }
            />
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
                        Buku Daftar Notulen Rapat Anggota
                    </h2>
                    <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span></div>
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">KOTA MAKASSAR</span></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span></div>
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL CETAK</span><span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul Rapat</label>
                                <div className="relative">
                                    <input id="search" name="search" type="text" placeholder="Contoh: RAT 2025..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal Rapat</label>
                                <div className="flex items-center gap-2">
                                    <input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                                    <span className="text-gray-500">s/d</span>
                                    <input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>
                        </div>
                         <div className="flex justify-end mt-3">
                            <Button onClick={resetFilters} variant="outline" className="text-sm px-4 py-1"><X size={16} /> Reset</Button>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNotulen.map((notulen) => (
                            <div key={notulen.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition">
                                <div className="border-b pb-3">
                                    <p className="text-xs text-gray-500">{new Date(notulen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <h3 className="font-bold text-lg text-brand-red-700 mt-1">{notulen.judul}</h3>
                                    <p className="text-xs text-gray-600">Jumlah Hadir: {notulen.jumlahHadir} orang</p>
                                </div>
                                <div className="py-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Agenda Utama:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {notulen.agenda.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Button onClick={() => handleLihatDetail(notulen)} variant="outline" className="text-xs px-3 py-1"><FileText size={14}/> Lihat Detail</Button>
                                    {notulen.fileUrl && <a href={notulen.fileUrl} download><Button variant="outline" className="text-xs px-3 py-1"><Download size={14}/> Unduh</Button></a>}
                                    <Button onClick={() => handleOpenModal('edit', notulen)} variant="outline" className="text-xs px-3 py-1"><Edit size={14}/> Edit</Button>
                                    <Button onClick={() => handleDelete(notulen.id, notulen.judul)} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={14}/> Hapus</Button>
                                </div>
                            </div>
                        ))}
                        {filteredNotulen.length === 0 && (
                            <div className="lg:col-span-2 text-center p-10 text-gray-500">
                                Tidak ada notulen yang sesuai dengan filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NotulenModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Notulen Baru' : 'Edit Notulen Rapat'}
                submitText={modalMode === 'add' ? 'Simpan Notulen' : 'Simpan Perubahan'}
                initialData={modalMode === 'add' ? initialDataForAdd : { ...selectedNotulen, agenda: selectedNotulen?.agenda.join('\n') || '' } as NotulenFormData}
            />

            <DetailNotulenModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                notulen={selectedNotulen}
            />
        </div>
    );
}