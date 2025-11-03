// Lokasi: frontend/app/dashboard/admin/buku-tamu/page.tsx
"use client";

import { useState, useMemo, useEffect, ChangeEvent, FormEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Search, Trash2, CheckSquare, X, Loader2, Edit, XCircle } from "lucide-react";
import clsx from "clsx";
// 1. Impor service, toast, dan tipe yang relevan
import toast, { Toaster } from 'react-hot-toast'; // Anda menggunakan react-hot-toast
import { adminService } from '@/services/admin.service'; 
import { ApiErrorResponse } from '@/types/api.types';
// Impor tipe data yang benar dari backend
import { GuestBookEntry, UpdateGuestBookDto } from '@/types/api.types';

// Helper format tanggal
const toIndoDate = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: '2-digit',
    minute: '2-digit'
  });
};

// --- Komponen Skeleton (dari kode Anda) ---
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
);

const BukuTamuSkeleton = () => (
  <div>
    <div className="mb-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mt-2" />
    </div>
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-40 mt-1" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mt-3" />
              <Skeleton className="h-4 w-5/6 mt-2" />
              <div className="flex justify-end gap-2 mt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- [BARU] Modal untuk Edit ---
const EditEntryModal = ({
  entry,
  onClose,
}: {
  entry: GuestBookEntry;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<UpdateGuestBookDto>({
    guestName: entry.guestName,
    origin: entry.origin,
    meetWith: entry.meetWith || "",
    purpose: entry.purpose,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const promise = adminService.updateGuestBookEntry(entry.id, formData);
    
    toast.promise(promise, {
      loading: 'Memperbarui entri...',
      success: () => {
        setIsLoading(false);
        onClose(); // Tutup modal
        return 'Entri berhasil diperbarui.';
      },
      error: (err) => {
        setIsLoading(false);
        const apiError = err as ApiErrorResponse;
        return `Gagal: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      },
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Edit Entri Buku Tamu</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <XCircle size={24} />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">Nama Tamu *</label>
              <input type="text" name="guestName" id="guestName" value={formData.guestName} onChange={handleChange} required disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Asal/Instansi *</label>
              <input type="text" name="origin" id="origin" value={formData.origin} onChange={handleChange} required disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="meetWith" className="block text-sm font-medium text-gray-700">Bertemu Dengan</label>
              <input type="text" name="meetWith" id="meetWith" value={formData.meetWith || ''} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Maksud & Tujuan *</label>
              <textarea name="purpose" id="purpose" rows={3} value={formData.purpose} onChange={handleChange} required disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Komponen Utama Halaman ---
export default function BukuTamuPage() {
  const [filters, setFilters] = useState({
    search: '',
  });
  // Gunakan tipe data yang BENAR dari backend
  const [entriesList, setEntriesList] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryToEdit, setEntryToEdit] = useState<GuestBookEntry | null>(null);

  // Fungsi untuk memuat data
  const loadEntries = async () => {
    setLoading(true);
    try {
      // Panggil service yang sudah kita definisikan
      const dataFromApi = await adminService.getGuestBookEntries();
      
      // Data dari backend sudah sesuai dengan tipe GuestBookEntry
      // Kita tidak perlu mapping rumit lagi
      setEntriesList(dataFromApi);

    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal memuat data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ganti useEffect untuk mengambil data dari API
  useEffect(() => {
    loadEntries();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '' });
  };

  const filteredEntries = useMemo(() => {
    return entriesList.filter(entry => {
      return (
        entry.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
        entry.origin.toLowerCase().includes(filters.search.toLowerCase())
      );
    });
  }, [entriesList, filters]);

  // 3. Fungsi Hapus
  const handleDelete = (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus pesan dari "${nama}"? Data tidak dapat dikembalikan.`)) return;

    // Panggil API DELETE /guest-book/:id
    const promise = adminService.deleteGuestBookEntry(id);
    
    toast.promise(promise, {
      loading: 'Menghapus pesan...',
      success: () => {
        // Update state secara lokal (Optimistic UI)
        setEntriesList(prevList => prevList.filter(entry => entry.id !== id));
        return 'Pesan berhasil dihapus.';
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        return `Gagal menghapus: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      },
    });
  };

  if (loading) {
    return <BukuTamuSkeleton />;
  }

  return (
    <div>
      {/* 4. Pastikan Toaster ada */}
      <Toaster position="top-right" /> 
      
      <AdminPageHeader
        title="Manajemen Buku Tamu"
        description="Kelola pesan, saran, dan pertanyaan yang masuk dari anggota dan publik."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Notulen Rapat Pengurus
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KOPERASI</span>
                <span className="text-gray-800 font-medium">
                  MERAH PUTIH JAYA
                </span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KAB / KOTA</span>
                <span className="text-gray-800 font-medium">KOTA MAKASSAR</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">
                  NO. BADAN HUKUM
                </span>
                <span className="text-gray-800 font-medium">
                  123/BH/IV.2/IX/2025
                </span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">
                  TANGGAL CETAK
                </span>
                <span className="text-gray-800 font-medium">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Daftar Pesan Masuk</h2>

          {/* --- Area Filter (Disederhanakan) --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Nama / Instansi</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Nama atau instansi..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEntries.length === 0 && !loading && (
                <div className="text-center p-8 text-gray-500">
                  {entriesList.length === 0 ? "Belum ada pesan masuk." : "Tidak ada pesan yang sesuai dengan filter."}
                </div>
            )}
            
            {/* Tampilkan data dari state */}
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">{entry.guestName}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {toIndoDate(entry.date)}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                    {entry.origin}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-500">Bertemu:</span> {entry.meetWith || '-'}
                  </p>
                  <p className="text-sm text-gray-700 italic border-l-4 border-gray-200 pl-4">
                    <span className="font-semibold text-gray-500 not-italic">Keperluan:</span> &quot;{entry.purpose}&quot;
                  </p>
                </div>
                
                {/* Aksi untuk Admin */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => setEntryToEdit(entry)} variant="outline" className="text-xs px-3 py-1">
                    <Edit size={14} /> Edit
                  </Button>
                  <Button onClick={() => handleDelete(entry.id, entry.guestName)} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={14} /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Render Modal Edit jika entryToEdit tidak null */}
      {entryToEdit && (
        <EditEntryModal 
          entry={entryToEdit} 
          onClose={() => setEntryToEdit(null)} 
        />
      )}
    </div>
  );
}