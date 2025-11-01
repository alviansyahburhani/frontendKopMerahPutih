// Lokasi: frontend/app/dashboard/anggota/buku-tamu/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader"; // Pakai ulang header
import { Search, X } from "lucide-react";
import Button from "@/components/Button";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
// 1. Ganti service ke memberService
import { memberService } from '@/services/member.service'; 
import { ApiErrorResponse } from '@/types/api.types';
// 2. Gunakan tipe data yang benar
import { GuestBookEntry } from '@/types/api.types';

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

// --- Komponen Skeleton (Sama seperti admin) ---
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
          {/* Filter status kita hilangkan */}
          <div className="md:col-span-2"> 
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
                  </div>
                  <Skeleton className="h-3 w-40 mt-1" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);


// --- Komponen Utama Halaman ---
export default function BukuTamuAnggotaPage() {
  const [filters, setFilters] = useState({
    search: '',
  });
  const [entriesList, setEntriesList] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memuat data
  const loadEntries = async () => {
    setLoading(true);
    try {
      // 3. Panggil memberService
      const dataFromApi = await memberService.getGuestBookEntries();
      setEntriesList(dataFromApi);
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal memuat data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []); 

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

  if (loading) {
    return <BukuTamuSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" /> 
      
      <AdminPageHeader
        title="Buku Tamu"
        description="Melihat riwayat kunjungan tamu yang tercatat di koperasi."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Tamu
          </h2>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Daftar Pesan Masuk</h2>

          {/* --- Area Filter (Hanya Search) --- */}
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
            
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white">
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
                
                {/* 4. TIDAK ADA AKSI UNTUK ANGGOTA */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}