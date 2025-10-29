// Lokasi: frontend/app/dashboard/admin/anjuran-pejabat/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit2, X } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data (berdasarkan file 14. Buku Anjuran Pejabat.xls) ---
type AnjuranPejabat = {
  id: string;
  tanggal: string;
  namaPejabat: string;
  jabatan: string;
  alamatInstansi: string;
  isiAnjuran: string;
  tanggapanPengurus?: string | null;
};

// --- Data Contoh ---
const mockAnjuran: AnjuranPejabat[] = [
  { id: 'ap001', tanggal: '2025-09-01', namaPejabat: 'Dr. H. Syarifuddin, M.Si.', jabatan: 'Kepala Dinas Koperasi & UKM', alamatInstansi: 'Jl. Veteran No. 123, Makassar', isiAnjuran: 'Dianjurkan kepada seluruh koperasi untuk segera melaporkan data SHU tahun buku 2024 paling lambat akhir bulan depan.', tanggapanPengurus: 'Baik, laporan sedang dalam proses finalisasi dan akan segera kami serahkan sebelum tenggat waktu.' },
  { id: 'ap002', tanggal: '2025-07-20', namaPejabat: 'Ibu Aisyah, S.E.', jabatan: 'Staf Bidang Pengawasan', alamatInstansi: 'Dinas Koperasi & UKM', isiAnjuran: 'Terkait adanya program pelatihan digitalisasi untuk UMKM, diharapkan koperasi dapat mendelegasikan 2 orang anggota untuk mengikuti.', tanggapanPengurus: null },
];

export default function AnjuranPejabatPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [anjuranList, setAnjuranList] = useState<AnjuranPejabat[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnjuranList(mockAnjuran);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => setFilters({ search: '' });

  const filteredAnjuran = useMemo(() => {
    return anjuranList.filter(anjuran => 
      anjuran.namaPejabat.toLowerCase().includes(filters.search.toLowerCase()) || 
      anjuran.isiAnjuran.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [anjuranList, filters]);

  const handleTambahAnjuran = () => alert("Membuka form untuk mencatat anjuran baru dari pejabat...");

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const AnjuranPejabatSkeleton = () => (
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

          {/* Entries List */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-4 w-64 mb-1" />
                      <Skeleton className="h-3 w-48 mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mt-4" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </div>
                <div className="p-4 bg-green-50 border-t border-green-200 rounded-b-lg">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <AnjuranPejabatSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Buku Anjuran Pejabat"
        description="Arsipkan semua anjuran dan instruksi resmi dari pejabat terkait."
        actionButton={
            <Button onClick={handleTambahAnjuran} variant="primary">
                <PlusCircle size={20} /><span>Catat Anjuran Baru</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Anjuran Pejabat
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
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anjuran / Nama Pejabat</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Ketik kata kunci..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={resetFilters} variant="outline"><X size={16} /> Reset</Button>
          </div>

          <div className="space-y-4">
            {filteredAnjuran.map((anjuran) => (
              <div key={anjuran.id} className="border border-gray-200 rounded-lg">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800">Dari: {anjuran.namaPejabat} <span className="font-normal text-gray-600">({anjuran.jabatan})</span></p>
                            <p className="text-xs text-gray-500 mt-1">
                                Dicatat pada: {new Date(anjuran.tanggal).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                         <div className="flex gap-2">
                            <Button variant="outline" className="text-xs p-2"><Edit2 size={14}/> Beri Tanggapan</Button>
                         </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-4 border-l-4 border-gray-200 pl-4 py-2">
                        {anjuran.isiAnjuran}
                    </p>
                </div>
                {anjuran.tanggapanPengurus && (
                    <div className="p-4 bg-green-50 border-t border-green-200 rounded-b-lg">
                        <p className="text-sm font-semibold text-green-800">Tanggapan Pengurus:</p>
                        <p className="text-sm text-green-700 mt-2 italic">&quot;{anjuran.tanggapanPengurus}&quot;</p>
                    </div>
                )}
              </div>
            ))}
             {filteredAnjuran.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    Tidak ada data anjuran yang ditemukan.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}