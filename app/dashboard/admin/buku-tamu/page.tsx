// Lokasi: frontend/app/dashboard/admin/buku-tamu/page.tsx
"use client";

import { useState, useMemo, useEffect, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Search, Trash2, CheckSquare, X } from "lucide-react";
import clsx from "clsx";
// 1. Import service, toast, dan tipe yang relevan
import toast, { Toaster } from 'react-hot-toast';
import { adminService, GuestBookMessage } from '@/services/admin.service'; 
import { ApiErrorResponse } from '@/types/api.types';

// --- Tipe Data Frontend (untuk tampilan) ---
// Kita tetap gunakan tipe ini, tapi kita akan mapping data API ke tipe ini
type BukuTamuEntry = {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  nama: string;
  asal: 'Anggota' | 'Tamu Publik';
  pesan: string;
  status: 'Baru' | 'Sudah Ditanggapi';
};

// --- Data Contoh Dihapus ---

export default function BukuTamuPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [entriesList, setEntriesList] = useState<BukuTamuEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Ganti useEffect untuk mengambil data dari API
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        // Panggil service untuk GET /guest-book
        const dataFromApi: GuestBookMessage[] = await adminService.getGuestBookEntries();
        
        // --- PENTING: Mapping Data Backend ke Tipe Frontend ---
        const mappedData: BukuTamuEntry[] = dataFromApi.map(entry => {
          
          // Parsing tanggal yang aman untuk menghindari "invalid time value"
          // Asumsi backend mengirim 'createdAt' atau 'tanggal'
          const dateSource = (entry as any).createdAt || entry.tanggal;
          let formattedDate = 'Invalid Date';
          
          if (dateSource) {
            try {
              const d = new Date(dateSource);
              if (!isNaN(d.getTime())) { 
                formattedDate = d.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error(`Nilai tanggal tidak valid diterima: ${dateSource}`);
            }
          } else {
             formattedDate = new Date().toISOString().split('T')[0]; // Fallback
          }

          // Sesuaikan nama field backend (kanan) ke field frontend (kiri)
          return {
            id: entry.id,
            tanggal: formattedDate,
            nama: (entry as any).guestName || entry.nama, // Gunakan guestName jika ada
            asal: (entry as any).origin || entry.asal, // Gunakan origin jika ada
            pesan: (entry as any).purpose || entry.pesan, // Gunakan purpose jika ada
            status: entry.status,
          };
        });
        
        setEntriesList(mappedData);

      } catch (err) {
        const apiError = err as ApiErrorResponse;
        const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
        toast.error(`Gagal memuat data: ${message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntries();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', status: '' });
  };

  const filteredEntries = useMemo(() => {
    return entriesList.filter(entry => {
      return (
        entry.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.status === '' || entry.status === filters.status)
      );
    });
  }, [entriesList, filters]);

  // 3. Ganti handleAction dengan fungsi spesifik
  const handleMarkAsResponded = (id: string, nama: string) => {
    if (!window.confirm(`Tandai pesan dari "${nama}" sudah ditanggapi?`)) return;

    // Panggil API PATCH /guest-book/:id
    const promise = adminService.updateGuestBookStatus(id, 'Sudah Ditanggapi');
    
    toast.promise(promise, {
      loading: 'Memperbarui status...',
      success: (updatedEntry) => {
        // Update state secara lokal (Optimistic UI)
        setEntriesList(prevList => 
          prevList.map(entry => 
            entry.id === id ? { ...entry, status: 'Sudah Ditanggapi' } : entry
          )
        );
        return 'Status berhasil diperbarui.';
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        return `Gagal memperbarui: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      },
    });
  };

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

  // Skeleton kecil
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
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <BukuTamuSkeleton />;
  }

  return (
    <div>
      {/* 4. Pastikan Toaster ada */}
      <Toaster position="top-right" /> 
      
      <AdminPageHeader
        title="Buku Tamu"
        description="Kelola pesan, saran, dan pertanyaan yang masuk dari anggota dan publik."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT (Tidak Berubah) --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Tamu
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KOPERASI</span>
                <span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KAB / KOTA</span>
                <span className="text-gray-800 font-medium">KOTA MAKASSAR</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">NO. BADAN HUKUM</span>
                <span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">TANGGAL</span>
                <span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------------------------------- */}

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Daftar Pesan Masuk</h2>

          {/* --- Area Filter (Tidak Berubah) --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Nama Pengirim</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Nama..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status Pesan</label>
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Baru">Baru</option>
                <option value="Sudah Ditanggapi">Sudah Ditanggapi</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* 5. Ganti 'filteredEntries' dari mock menjadi data API */}
            {filteredEntries.length === 0 && !loading && (
                <div className="text-center p-8 text-gray-500">
                    {entriesList.length === 0 ? "Belum ada pesan masuk." : "Tidak ada pesan yang sesuai dengan filter."}
                </div>
            )}
            
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">{entry.nama}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        entry.asal === 'Anggota' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.asal}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    entry.status === 'Baru' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {entry.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-3 italic border-l-4 border-gray-200 pl-4">
                  &quot;{entry.pesan}&quot;
                </p>
                
                {/* 6. Ganti onClick ke fungsi yang baru */}
                <div className="flex justify-end gap-2 mt-4">
                  {entry.status === 'Baru' && (
                    <Button onClick={() => handleMarkAsResponded(entry.id, entry.nama)} variant="outline" className="text-xs px-3 py-1">
                      <CheckSquare size={14} /> Tandai Sudah Ditanggapi
                    </Button>
                  )}
                  <Button onClick={() => handleDelete(entry.id, entry.nama)} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={14} /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}