// Lokasi: frontend/app/dashboard/admin/notulen-rapat-pengawas/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, FileText, X } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data (berdasarkan file 09. Buku Notulen Rapat Pengawas.xls) ---
type NotulenRapat = {
  id: string;
  judul: string;
  tanggal: string;
  agenda: string[];
  jumlahHadir: number;
  jumlahPengawas: number;
  fileUrl?: string;
};

// --- Data Contoh ---
const mockNotulen: NotulenRapat[] = [
  { 
    id: 'nrw001', 
    judul: 'Rapat Pengawas - Pemeriksaan Kas Bulanan', 
    tanggal: '2025-09-01',
    agenda: ['Pemeriksaan saldo kas fisik dan di bank', 'Verifikasi transaksi pengeluaran bulan Agustus', 'Penyusunan laporan hasil pemeriksaan'],
    jumlahHadir: 3,
    jumlahPengawas: 3,
    fileUrl: '#'
  },
  { 
    id: 'nrw002', 
    judul: 'Rapat Tinjauan Kinerja Pengurus', 
    tanggal: '2025-07-05',
    agenda: ['Evaluasi pencapaian target oleh pengurus', 'Pembahasan temuan-temuan minor', 'Pemberian rekomendasi perbaikan'],
    jumlahHadir: 3,
    jumlahPengawas: 3,
    fileUrl: '#'
  },
];

export default function NotulenRapatPengawasPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [notulenList, setNotulenList] = useState<NotulenRapat[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotulenList(mockNotulen);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => setFilters({ search: '' });

  const filteredNotulen = useMemo(() => {
    return notulenList.filter(notulen => 
      notulen.judul.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [notulenList, filters]);

  const handleTambahNotulen = () => alert("Membuka halaman untuk membuat notulen rapat pengawas baru...");

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const NotulenRapatPengawasSkeleton = () => (
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
    return <NotulenRapatPengawasSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Buku Notulen Rapat Pengawas"
        description="Arsipkan dan kelola semua notulensi dari rapat internal dewan pengawas."
        actionButton={
            <Button onClick={handleTambahNotulen} variant="primary">
                <PlusCircle size={20} /><span>Tambah Notulen</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Notulen Rapat Pengawas
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
              <div className="grow">
                <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul Rapat</label>
                <div className="relative">
                  <input id="search" name="search" type="text" placeholder="Ketik judul rapat..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <Button onClick={resetFilters} variant="outline"><X size={16} /> Reset</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotulen.map((notulen) => (
              <div key={notulen.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition">
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500">{new Date(notulen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <h3 className="font-bold text-lg text-brand-red-700 mt-1">{notulen.judul}</h3>
                  <p className="text-xs text-gray-600">Kehadiran: {notulen.jumlahHadir} dari {notulen.jumlahPengawas} pengawas</p>
                </div>
                <div className="py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Agenda Utama:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {notulen.agenda.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button variant="outline" className="text-xs px-3 py-1"><FileText size={14}/> Lihat Detail</Button>
                </div>
              </div>
            ))}
             {filteredNotulen.length === 0 && (
              <div className="lg:col-span-2 text-center p-10 text-gray-500">
                  Tidak ada notulen yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}