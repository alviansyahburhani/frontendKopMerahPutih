"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit, Trash2, X, Eye, ArrowLeft, Save, Upload, LinkIcon, Loader2 } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import toast, { Toaster } from 'react-hot-toast';

// --- Impor tipe dan service ---
import { 
  adminService, 
  News, 
  CreateNewsDto, 
  UpdateNewsDto,
  PaginatedNewsResult
} from '@/services/admin.service';
import { ApiErrorResponse } from "@/types/api.types";

// --- Tipe Data ---
type Artikel = News; 

// --- KOMPONEN EDITOR ARTIKEL (DIMODIFIKASI) ---
const ArtikelEditor = ({ 
  artikel, 
  onBack, 
  onSave 
}: { 
  artikel: Artikel | null; 
  onBack: () => void; 
  onSave: (data: CreateNewsDto | UpdateNewsDto, imageFile: File | null) => Promise<void>; 
}) => {
    
    // [PERBAIKAN] Inisialisasi state agar cocok dengan DTO
    const [formData, setFormData] = useState<CreateNewsDto | UpdateNewsDto>({
      title: artikel?.title || '',
      content: artikel?.content || '', // <-- Wajib ada
      status: artikel?.status || 'DRAFT',
      excerpt: artikel?.excerpt || '', // <-- TAMBAHKAN 'excerpt'
      sourceLink: artikel?.sourceLink || '', // <-- PERBAIKAN: Gunakan 'sourceLink'
    });
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(artikel?.imageUrl || null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'status' 
          ? (value === 'Dipublikasikan' ? 'PUBLISHED' : (value === 'Diarsipkan' ? 'ARCHIVED' : 'DRAFT'))
          : value 
      }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!formData.title) {
        toast.error("Judul artikel tidak boleh kosong.");
        return;
      }
      // [PERBAIKAN] Tambahkan validasi untuk 'content'
      if (!formData.content) {
        toast.error("Konten artikel tidak boleh kosong.");
        return;
      }
      
      setLoading(true);
      
      try {
        await onSave(formData, imageFile);
      } catch (error) {
        // onSave (induk) sudah menangani toast error
      } finally {
        setLoading(false);
      }
    };
    
    const displayStatus = formData.status === 'PUBLISHED' ? 'Dipublikasikan' : (formData.status === 'ARCHIVED' ? 'Diarsipkan' : 'Draft');

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button type="button" onClick={onBack} disabled={loading} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeft size={20} /> Kembali ke Daftar Artikel
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {artikel ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        {displayStatus === 'Draft' ? 'Simpan sebagai Draft' : (displayStatus === 'Diarsipkan' ? 'Simpan Arsip' : 'Publikasikan')}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel*</label>
                        <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required disabled={loading} className="w-full p-2 border rounded-lg" />
                    </div>
                    {/* [PERBAIKAN] Pastikan field 'excerpt' ada */}
                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Ringkasan (Opsional)</label>
                        <textarea id="excerpt" name="excerpt" rows={3} value={formData.excerpt || ''} onChange={handleChange} disabled={loading} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Konten*</label>
                        <textarea id="content" name="content" rows={15} value={formData.content || ''} onChange={handleChange} required disabled={loading} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status" name="status" value={displayStatus} onChange={handleChange} disabled={loading} className="w-full p-2 border rounded-lg bg-white">
                            <option value="Draft">Draft</option>
                            <option value="Dipublikasikan">Dipublikasikan</option>
                            <option value="Diarsipkan">Diarsipkan</option>
                        </select>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Unggulan</label>
                        <div className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 relative overflow-hidden">
                           {imagePreview ? (
                             // [PERBAIKAN] Ganti 'layout' dan 'objectFit'
                            <img 
                               src={imagePreview} 
                               alt="Preview" 
                               className="h-full w-full object-cover"
                             />
                           ) : (
                             <div className="text-center">
                               <Upload size={32}/>
                                <p className="mt-1 text-xs">Pilih gambar</p>
                            </div>
                           )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} className="mt-2 w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    {/* [PERBAIKAN] Ganti 'sourceUrl' menjadi 'sourceLink' */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="sourceLink" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <LinkIcon size={16} /> Link Sumber Berita (Opsional)
                        </label>
                        <input id="sourceLink" name="sourceLink" type="url" placeholder="https://..." value={formData.sourceLink || ''} onChange={handleChange} disabled={loading} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>
            </div>
        </form>
    );
};

// --- KOMPONEN UTAMA (ManajemenBeritaPage) ---
export default function ManajemenBeritaPage() {
    const [filters, setFilters] = useState({ search: '', status: '' });
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
    const [artikelList, setArtikelList] = useState<Artikel[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllNews(); 
        const articles = response.data;
        articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setArtikelList(articles);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        toast.error(`Gagal memuat artikel: ${apiError.message}`);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
        if (view === 'list') { 
            loadData();
        }
    }, [view, loadData]); 

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const resetFilters = () => {
        setFilters({ search: '', status: '' });
    };

    const filteredArtikel = useMemo(() => {
        return artikelList.filter(artikel => {
            const backendStatus = filters.status === 'Dipublikasikan' ? 'PUBLISHED' 
                                : (filters.status === 'Draft' ? 'DRAFT' 
                                : (filters.status === 'Diarsipkan' ? 'ARCHIVED' : ''));
            return (
                artikel.title.toLowerCase().includes(filters.search.toLowerCase()) &&
                (backendStatus === '' || artikel.status === backendStatus)
            );
        });
    }, [artikelList, filters]);

    const handleHapus = (id: string, judul: string) => {
        if(!window.confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"?`)){
          return;
        }
        
        const promise = adminService.deleteNews(id);
        toast.promise(promise, {
          loading: 'Menghapus artikel...',
          success: () => {
            setArtikelList(prev => prev.filter(a => a.id !== id));
            return 'Artikel berhasil dihapus.';
          },
          error: (err: ApiErrorResponse) => `Gagal: ${err.message}`
        });
    };

    const handleTulisBaru = () => {
        setSelectedArtikel(null);
        setView('editor');
    };

    const handleEdit = (artikel: Artikel) => {
        setSelectedArtikel(artikel);
        setView('editor');
    };

    // [PERBAIKAN] Fungsi ini membersihkan payload sebelum mengirim
    const handleSaveArtikel = async (data: CreateNewsDto | UpdateNewsDto, imageFile: File | null) => {
      const toastId = toast.loading(selectedArtikel ? 'Memperbarui artikel...' : 'Menyimpan artikel...');

      // --- [PERBAIKAN DI SINI] ---
      // Buat salinan payload untuk dimodifikasi
      const payload = { ...data };

      // Jika sourceLink ada tapi kosong, hapus propertinya
      // agar tidak gagal validasi @IsUrl di backend
      if (payload.sourceLink === '') {
        delete payload.sourceLink;
      }
      // Lakukan hal yang sama untuk excerpt jika kosong
      if (payload.excerpt === '') {
        delete payload.excerpt;
      }
      // --- [AKHIR PERBAIKAN] ---

      try {
        let savedArtikel: Artikel;

        if (selectedArtikel) {
          // Kirim payload yang sudah bersih
          savedArtikel = await adminService.updateNews(selectedArtikel.id, payload as UpdateNewsDto);
        } else {
          // Kirim payload yang sudah bersih
          savedArtikel = await adminService.createNews(payload as CreateNewsDto);
        }
        
        if (imageFile) {
          toast.loading('Mengunggah gambar...', { id: toastId });
          savedArtikel = await adminService.uploadNewsImage(savedArtikel.id, imageFile);
        }

        toast.success('Artikel berhasil disimpan!', { id: toastId });
        setView('list'); 

      } catch (err) {
        const apiError = err as ApiErrorResponse;
        // Tangani pesan error validasi spesifik
        if (apiError.message && Array.isArray(apiError.message)) {
          toast.error(`Gagal: ${apiError.message.join(', ')}`, { id: toastId });
        } else {
          toast.error(`Gagal: ${apiError.message || 'Error tidak diketahui'}`, { id: toastId });
        }
        throw apiError; 
      }
    };

    // --- Skeleton (Tidak Berubah) ---
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
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1"><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="w-full h-10 rounded-lg" /></div>
                        <div><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="w-full h-10 rounded-lg" /></div>
                        <div><Skeleton className="h-10 w-full" /></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th><th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b text-sm">
                                        <td className="p-4"><Skeleton className="h-4 w-40 mb-1" /><Skeleton className="h-3 w-24" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-28" /></td><td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td><td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    if (view === 'editor') {
        return <ArtikelEditor artikel={selectedArtikel} onBack={() => setView('list')} onSave={handleSaveArtikel} />;
    }

    if (loading) {
        return <BeritaSkeleton />;
    }

    return (
        <div>
            <Toaster position="top-right" />
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
                                <option value="Diarsipkan">Diarsipkan</option>
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
                                    <th className="p-4 font-medium">Tanggal</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArtikel.map((artikel) => {
                                  const displayStatus = artikel.status === 'PUBLISHED' ? 'Dipublikasikan' : (artikel.status === 'ARCHIVED' ? 'Diarsipkan' : 'Draft');
                                  const displayDate = artikel.publishedAt || artikel.updatedAt;
                                  
                                  return (
                                      <tr key={artikel.id} className="border-b hover:bg-gray-50 text-sm transition-colors duration-150">
                                          <td className="p-4">
                                              <p className="font-bold text-gray-800">{artikel.title}</p>
                                              <p className="text-xs text-gray-500">Oleh: {artikel.author?.fullName || 'Admin'}</p>
                                          </td>
                                          <td className="p-4">{new Date(displayDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                          <td className="p-4 text-center">
                                              <span className={clsx(
                                                'px-3 py-1 text-xs font-semibold rounded-full',
                                                artikel.status === 'PUBLISHED' && 'bg-green-100 text-green-700',
                                                artikel.status === 'DRAFT' && 'bg-gray-100 text-gray-600',
                                                artikel.status === 'ARCHIVED' && 'bg-yellow-100 text-yellow-700',
                                              )}>
                                                  {displayStatus}
                                              </span>
                                          </td>
                                          <td className="p-4 text-center space-x-2">
                                              {artikel.status === 'PUBLISHED' && (
                                                <a href={`/berita/${artikel.slug}`} target="_blank" rel="noopener noreferrer" title="Lihat di Halaman Publik">
                                                  <Button variant="outline" className="text-xs p-2"><Eye size={16}/></Button>
                                                </a>
                                              )}
                                              <Button onClick={() => handleEdit(artikel)} variant="outline" className="text-xs p-2" title="Edit Artikel">
                                                <Edit size={16}/>
                                              </Button>
                                              <Button onClick={() => handleHapus(artikel.id, artikel.title)} variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50" title="Hapus Artikel">
                                                <Trash2 size={16}/>
                                              </Button>
                                          </td>
                                      </tr>
                                    );
                                })}
                                {filteredArtikel.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center p-8 text-gray-500">
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