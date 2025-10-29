// Lokasi: frontend/app/dashboard/admin/saran-pengawas/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit2, Trash2, X } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data (berdasarkan file 13. Buku Saran Pengawas.xls) ---
type SaranPengawas = {
  id: string;
  tanggal: string;
  namaPengawas: string;
  isiSaran: string;
  tanggapanPengurus?: string | null;
};

// --- Data Contoh ---
const mockSaran: SaranPengawas[] = [
  { id: 'sp001', tanggal: '2025-08-20', namaPengawas: 'Rahmat Hidayat', isiSaran: 'Mohon untuk segera melakukan stok opname untuk aset di gudang. Ditemukan ada beberapa selisih data pada laporan bulan lalu.', tanggapanPengurus: 'Baik, akan segera dijadwalkan stok opname pada akhir pekan ini. Terima kasih atas masukannya.' },
  { id: 'sp002', tanggal: '2025-07-10', namaPengawas: 'Kartika Sari', isiSaran: 'Perlu dipertimbangkan untuk meningkatkan batas maksimal pinjaman modal usaha bagi anggota yang memiliki rekam jejak pembayaran baik.', tanggapanPengurus: null },
];

export default function SaranPengawasPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [saranList, setSaranList] = useState<SaranPengawas[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaranList(mockSaran);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => setFilters({ search: '' });

  const filteredSaran = useMemo(() => {
    return saranList.filter(saran => 
      saran.namaPengawas.toLowerCase().includes(filters.search.toLowerCase()) || 
      saran.isiSaran.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [saranList, filters]);

  const handleTambahSaran = () => alert("Membuka form untuk mencatat saran/temuan baru dari pengawas...");

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const SaranPengawasSkeleton = () => (
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
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-64 mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded" />
                      <Skeleton className="h-8 w-16 rounded" />
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
    return <SaranPengawasSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Buku Saran Pengawas"
        description="Arsipkan semua saran, temuan, dan catatan dari dewan pengawas."
        actionButton={
            <Button onClick={handleTambahSaran} variant="primary">
                <PlusCircle size={20} /><span>Catat Saran Baru</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Saran Pengawas
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
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Saran / Pengawas</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Ketik kata kunci..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={resetFilters} variant="outline"><X size={16} /> Reset</Button>
          </div>

          <div className="space-y-4">
            {filteredSaran.map((saran) => (
              <div key={saran.id} className="border border-gray-200 rounded-lg">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800">Dari: {saran.namaPengawas}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Dicatat pada: {new Date(saran.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                         <div className="flex gap-2">
                            <Button variant="outline" className="text-xs p-2"><Edit2 size={14}/> Beri Tanggapan</Button>
                            <Button variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={14}/></Button>
                         </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-4 border-l-4 border-gray-200 pl-4 py-2">
                        {saran.isiSaran}
                    </p>
                </div>
                {saran.tanggapanPengurus && (
                    <div className="p-4 bg-green-50 border-t border-green-200 rounded-b-lg">
                        <p className="text-sm font-semibold text-green-800">Tanggapan Pengurus:</p>
                        <p className="text-sm text-green-700 mt-2 italic">&quot;{saran.tanggapanPengurus}&quot;</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}