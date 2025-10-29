// Lokasi: frontend/app/(superadmin)/superadmin/berita/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect, useDeferredValue, useCallback } from "react";
import clsx from "clsx";
// Impor komponen yang mungkin perlu dibuat/disesuaikan untuk Super Admin jika berbeda
// import SuperAdminPageHeader from "@/components/SuperAdminPageHeader"; // Contoh
import Button from "@/components/Button";
import { PlusCircle, Search, Edit, Trash2, X, ArrowLeft, Save, Upload, LinkIcon, Newspaper } from "lucide-react";

// --- Tipe Data Artikel (Sama seperti admin tenant) ---
type Artikel = {
  id: string;
  judul: string;
  konten?: string;
  imageUrl?: string;
  sourceUrl?: string;
  tanggalPublikasi: string;
  penulis: string; // Bisa jadi Super Admin
  status: 'Dipublikasikan' | 'Draft';
  dilihat: number;
};

// --- Data Contoh (Ganti dengan fetch API ke backend global news) ---
const mockArtikelGlobal: Artikel[] = [
  { id: 'global-art001', judul: 'Selamat Datang di Platform Koperasi Digital Merah Putih!', tanggalPublikasi: '2025-10-01', penulis: 'Super Admin', status: 'Dipublikasikan', dilihat: 1058, konten: 'Ini adalah platform baru untuk digitalisasi koperasi...', sourceUrl: 'https://sistemkoperasi.id/news/welcome' },
  { id: 'global-art002', judul: 'Panduan Pendaftaran Koperasi Baru', tanggalPublikasi: '2025-10-05', penulis: 'Super Admin', status: 'Dipublikasikan', dilihat: 812, konten: 'Langkah-langkah mendaftarkan koperasi Anda...' },
];

// --- Komponen Editor Artikel (Bisa Reusable atau Buat Versi Super Admin) ---
// Untuk saat ini, kita anggap komponen Editor sama, tapi idealnya dipisah
const ArtikelEditor = ({ artikel, onBack, onSave }: { artikel: Artikel | null; onBack: () => void; onSave: (data: Artikel) => void; }) => {
    // ... (Kode Editor sama seperti di admin tenant, pastikan state awal penulis = 'Super Admin') ...
    // State awal
     const [formData, setFormData] = useState<Artikel>(
        artikel || {
            id: `global-art-${Date.now()}`,
            judul: '',
            konten: '',
            sourceUrl: '',
            tanggalPublikasi: new Date().toISOString().split('T')[0],
            penulis: 'Super Admin', // <-- Default penulis Super Admin
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
                        <ArrowLeft size={20} /> Kembali ke Daftar Artikel Global
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {artikel ? 'Edit Artikel Global' : 'Tulis Artikel Global Baru'}
                    </h2>
                </div>
                 <div className="flex gap-2">
                    <Button type="submit" variant="primary">
                        <Save size={18} /> {formData.status === 'Draft' ? 'Simpan Draft' : 'Publikasikan'}
                    </Button>
                </div>
            </div>

             <div className="bg-white rounded-xl shadow-lg border p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* ... (Isi form sama seperti editor di admin tenant) ... */}
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
                    {/* ... (Input gambar & link sumber) ... */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Unggulan</label>
                        {/* Implementasi upload gambar di sini */}
                         <div className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500"><Upload size={32}/></div>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="sourceUrl" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><LinkIcon size={16} /> Link Sumber (Opsional)</label>
                        <input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://..." value={formData.sourceUrl} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>
            </div>
        </form>
    );
};

// --- KOMPONEN UTAMA ---
export default function ManajemenBeritaGlobalPage() {
    const [filters, setFilters] = useState({ search: '', status: '' });
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
    const [artikelList, setArtikelList] = useState<Artikel[]>([]); // akan diisi setelah loading
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setArtikelList(mockArtikelGlobal);
            setLoading(false);
        }, 800);
        return () => clearTimeout(t);
    }, []);

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const resetFilters = () => setFilters({ search: '', status: '' });

    const deferredSearch = useDeferredValue(filters.search);
    const filteredArtikel = useMemo(() => {
        const q = deferredSearch.toLowerCase();
        const status = filters.status;
        return artikelList.filter(artikel =>
            artikel.judul.toLowerCase().includes(q) && (status === '' || artikel.status === status)
        );
    }, [deferredSearch, filters.status, artikelList]);

    const handleHapus = (id: string, judul: string) => {
        if(window.confirm(`Hapus artikel global "${judul}"?`)){
          // TODO: Panggil API DELETE /global-news/{id}
          alert(`Simulasi: Artikel "${judul}" dihapus.`);
          setArtikelList(prev => prev.filter(a => a.id !== id)); // Update state
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
        // TODO: Panggil API POST atau PATCH /global-news
        console.log("Menyimpan artikel global:", data);
        alert(`Simulasi: Artikel global "${data.judul}" disimpan!`);
        if (selectedArtikel) { // Jika mode edit
            setArtikelList(prev => prev.map(a => a.id === data.id ? data : a));
        } else { // Jika mode tambah
            setArtikelList(prev => [data, ...prev]);
        }
        setView('list');
    };

    if (view === 'editor') {
        return <ArtikelEditor artikel={selectedArtikel} onBack={() => setView('list')} onSave={handleSaveArtikel} />;
    }

    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    if (loading) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Skeleton className="h-9 w-80" />
                        <Skeleton className="h-5 w-96 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-44" />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-24 w-full mt-6" />
                    <div className="mt-6 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Halaman (bisa pakai komponen AdminPageHeader atau buat SuperAdminPageHeader) */}
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Newspaper /> Manajemen Berita Global</h1>
                <p className="mt-1 text-gray-600">Kelola berita yang tampil di landing page utama sistemkoperasi.id.</p>
                </div>
                <Button onClick={handleTulisBaru} variant="primary">
                    <PlusCircle size={20} /><span>Tulis Artikel Baru</span>
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-700">Daftar Artikel Global</h2>
                    {/* Filter Area */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                       <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul</label>
                            <div className="relative">
                                <input id="search" name="search" type="text" placeholder="Judul..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg bg-white">
                                <option value="">Semua</option>
                                <option value="Dipublikasikan">Dipublikasikan</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
                        </div>
                    </div>
                    {/* Tabel Artikel */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Judul Artikel</th>
                                    <th className="p-4 font-medium">Tanggal</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArtikel.length > 0 ? filteredArtikel.map((artikel) => (
                                    <tr key={artikel.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                        <td className="p-4"><p className="font-bold text-gray-800">{artikel.judul}</p><p className="text-xs text-gray-500">Penulis: {artikel.penulis}</p></td>
                                        <td className="p-4">{new Date(artikel.tanggalPublikasi).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4 text-center"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${artikel.status === 'Dipublikasikan' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{artikel.status}</span></td>
                                        <td className="p-4 text-center space-x-2">
                                            {/* <Button size="sm" variant="outline" className="text-xs p-2"><Eye size={16}/></Button> */}
                                            <Button size="sm" onClick={() => handleEdit(artikel)} variant="outline" className="text-xs p-2"><Edit size={16}/></Button>
                                            <Button size="sm" onClick={() => handleHapus(artikel.id, artikel.judul)} variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={16}/></Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center p-8 text-gray-500">Tidak ada artikel global.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
