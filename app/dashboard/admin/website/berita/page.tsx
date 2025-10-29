// Lokasi: frontend/app/dashboard/admin/website/berita/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit, Trash2, X, Eye, ArrowLeft, Save, Upload, LinkIcon } from "lucide-react"; // 1. Impor LinkIcon
import clsx from "clsx";

// --- Tipe Data Diperbarui ---
type Artikel = {
  id: string;
  judul: string;
  konten?: string;
  imageUrl?: string;
  sourceUrl?: string; // <-- INPUTAN BARU DITAMBAHKAN
  tanggalPublikasi: string;
  penulis: string;
  status: 'Dipublikasikan' | 'Draft';
  dilihat: number;
};

// --- Data Contoh Diperbarui ---
const mockArtikel: Artikel[] = [
  { id: 'art001', judul: 'Rapat Anggota Tahunan (RAT) 2025 Sukses Digelar', tanggalPublikasi: '2025-03-16', penulis: 'Andi Wijaya', status: 'Dipublikasikan', dilihat: 258, konten: 'Ini adalah isi lengkap dari berita RAT...', sourceUrl: 'https://news.example.com/rat-2025' },
  { id: 'art002', judul: 'Koperasi Merah Putih Buka Unit Usaha Baru: Toko Sembako', tanggalPublikasi: '2025-02-20', penulis: 'Andi Wijaya', status: 'Dipublikasikan', dilihat: 412, konten: '...' },
  { id: 'art003', judul: 'Panduan Pengajuan Pinjaman Online untuk Anggota', tanggalPublikasi: '2025-01-05', penulis: 'Siti Aminah', status: 'Dipublikasikan', dilihat: 1024, konten: '...' },
  { id: 'art004', judul: 'Rencana Pelatihan Kewirausahaan [DRAFT]', tanggalPublikasi: '2025-09-10', penulis: 'Andi Wijaya', status: 'Draft', dilihat: 0, konten: '...' },
];

// --- KOMPONEN EDITOR ARTIKEL ---
const ArtikelEditor = ({ artikel, onBack, onSave }: { artikel: Artikel | null; onBack: () => void; onSave: (data: Artikel) => void; }) => {
    
    // 2. Inisialisasi state formData dengan sourceUrl
    const [formData, setFormData] = useState<Artikel>(
        artikel || {
            id: `art-${Date.now()}`,
            judul: '',
            konten: '',
            sourceUrl: '', // <-- Nilai awal untuk inputan baru
            tanggalPublikasi: new Date().toISOString().split('T')[0],
            penulis: 'Admin Koperasi',
            status: 'Draft',
            dilihat: 0
        }
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeft size={20} /> Kembali ke Daftar Artikel
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {artikel ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" variant="primary">
                        <Save size={18} /> {formData.status === 'Draft' ? 'Simpan sebagai Draft' : 'Publikasikan'}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label htmlFor="judul" className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel</label>
                        <input id="judul" name="judul" type="text" value={formData.judul} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="konten" className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                        <textarea id="konten" name="konten" rows={15} value={formData.konten} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                            <option value="Draft">Draft</option>
                            <option value="Dipublikasikan">Dipublikasikan</option>
                        </select>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Unggulan</label>
                        <div className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500">
                           <div className="text-center">
                                <Upload size={32}/>
                                <p className="mt-1 text-xs">Klik untuk memilih gambar</p>
                           </div>
                        </div>
                    </div>
                    {/* 3. Tambahkan input field untuk link berita di sini */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="sourceUrl" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <LinkIcon size={16} /> Link Sumber Berita (Opsional)
                        </label>
                        <input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://..." value={formData.sourceUrl} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>
            </div>
        </form>
    );
};

// --- KOMPONEN UTAMA (ManajemenBeritaPage) TIDAK BERUBAH BANYAK ---
export default function ManajemenBeritaPage() {
    const [filters, setFilters] = useState({ search: '', status: '' });
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
    const [artikelList, setArtikelList] = useState<Artikel[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setArtikelList(mockArtikel);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const resetFilters = () => {
        setFilters({ search: '', status: '' });
    };

    const filteredArtikel = useMemo(() => {
        return artikelList.filter(artikel => {
            return (
                artikel.judul.toLowerCase().includes(filters.search.toLowerCase()) &&
                (filters.status === '' || artikel.status === filters.status)
            );
        });
    }, [artikelList, filters]);

    const handleHapus = (judul: string) => {
        if(window.confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"?`)){
          alert(`Simulasi: Artikel "${judul}" telah dihapus.`);
        }
    };

    const handleTulisBaru = () => {
        setSelectedArtikel(null);
        setView('editor');
    };

    const handleEdit = (artikel: Artikel) => {
        setSelectedArtikel(artikel);
        setView('editor');
    };

    const handleSaveArtikel = (data: Artikel) => {
        console.log("Menyimpan artikel:", data);
        alert(`Simulasi: Artikel "${data.judul}" berhasil disimpan!`);
        setView('list');
    };

    // Skeleton kecil
    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    const BeritaSkeleton = () => (
        <div>
            <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <Skeleton className="h-6 w-40 mb-6" />
                    
                    {/* Filter Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="w-full h-10 rounded-lg" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-16 mb-1" />
                            <Skeleton className="w-full h-10 rounded-lg" />
                        </div>
                        <div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b text-sm">
                                        <td className="p-4">
                                            <Skeleton className="h-4 w-40 mb-1" />
                                            <Skeleton className="h-3 w-24" />
                                        </td>
                                        <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // If we're in editor mode, don't show skeleton
    if (view === 'editor') {
        return <ArtikelEditor artikel={selectedArtikel} onBack={() => setView('list')} onSave={handleSaveArtikel} />;
    }

    if (loading) {
        return <BeritaSkeleton />;
    }

    return (
        <div>
            <AdminPageHeader
                title="Manajemen Berita & Artikel"
                description="Buat, edit, dan kelola semua konten berita untuk landing page."
                actionButton={
                    <Button onClick={handleTulisBaru} variant="primary">
                        <PlusCircle size={20} /><span>Tulis Artikel Baru</span>
                    </Button>
                }
            />
      
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-700">Daftar Artikel</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul Artikel</label>
                            <div className="relative">
                                <input id="search" name="search" type="text" placeholder="Judul..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                                <option value="">Semua</option>
                                <option value="Dipublikasikan">Dipublikasikan</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Judul Artikel</th>
                                    <th className="p-4 font-medium">Tanggal Publikasi</th>
                                    <th className="p-4 font-medium text-center">Dilihat</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArtikel.map((artikel) => (
                                    <tr key={artikel.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800">{artikel.judul}</p>
                                            <p className="text-xs text-gray-500">Penulis: {artikel.penulis}</p>
                                        </td>
                                        <td className="p-4">{new Date(artikel.tanggalPublikasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                        <td className="p-4 text-center">{artikel.dilihat.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${artikel.status === 'Dipublikasikan' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {artikel.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <Button variant="outline" className="text-xs p-2"><Eye size={16}/></Button>
                                            <Button onClick={() => handleEdit(artikel)} variant="outline" className="text-xs p-2"><Edit size={16}/></Button>
                                            <Button onClick={() => handleHapus(artikel.judul)} variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={16}/></Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredArtikel.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center p-8 text-gray-500">
                                            Tidak ada artikel yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}