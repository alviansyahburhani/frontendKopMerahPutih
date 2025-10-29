// Lokasi: frontend/app/dashboard/admin/catatan-kejadian/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data (berdasarkan file 15. Buku Catatan Kejadian Penting.xls) ---
type CatatanKejadian = {
  id: string;
  tanggal: string;
  uraianKejadian: string;
  penyelesaian: string;
  sebabKejadian?: string | null;
};

// --- Data Contoh ---
const mockKejadian: CatatanKejadian[] = [
  { id: 'ck001', tanggal: '2025-09-10', uraianKejadian: 'Sistem server sempat mati selama 15 menit karena listrik padam.', penyelesaian: 'Listrik kembali normal dan server berhasil di-restart. Tidak ada data yang hilang.', sebabKejadian: 'Pemadaman listrik dari PLN.' },
  { id: 'ck002', tanggal: '2025-08-22', uraianKejadian: 'Kunjungan mendadak dari perwakilan Dinas Koperasi untuk pemeriksaan rutin.', penyelesaian: 'Semua dokumen berhasil disajikan dan pemeriksaan berjalan lancar. Mendapat apresiasi.', sebabKejadian: 'Pemeriksaan rutin tahunan.' },
  { id: 'ck003', tanggal: '2025-08-05', uraianKejadian: 'Terjadi kebocoran kecil pada atap di area gudang.', penyelesaian: 'Sudah ditangani sementara, perbaikan permanen akan dijadwalkan minggu depan.', sebabKejadian: 'Hujan deras dan angin kencang.' },
];

export default function CatatanKejadianPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [kejadianList, setKejadianList] = useState<CatatanKejadian[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setKejadianList(mockKejadian);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => setFilters({ search: '' });

  const filteredKejadian = useMemo(() => {
    return kejadianList.filter(kejadian => 
      kejadian.uraianKejadian.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [kejadianList, filters]);

  const handleTambahCatatan = () => alert("Membuka form untuk mencatat kejadian penting baru...");

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const CatatanKejadianSkeleton = () => (
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

          {/* Timeline Section */}
          <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-8 ml-8">
                <Skeleton className="absolute -left-5 w-8 h-8 rounded-full" />
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-5/6 mb-1" />
                  </div>
                  <div className="mt-3">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  {i === 0 && (
                    <div className="mt-3">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4 border-t pt-3">
                    <Skeleton className="h-8 w-12 rounded" />
                    <Skeleton className="h-8 w-12 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <CatatanKejadianSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Buku Catatan Kejadian Penting"
        description="Dokumentasikan semua peristiwa penting di luar transaksi rutin."
        actionButton={
            <Button onClick={handleTambahCatatan} variant="primary">
                <PlusCircle size={20} /><span>Catat Kejadian Baru</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Catatan Kejadian Penting
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
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Uraian Kejadian</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Ketik kata kunci..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={resetFilters} variant="outline"><X size={16} /> Reset</Button>
          </div>

          {/* --- Tampilan Linimasa Kejadian --- */}
          <div className="relative border-l-2 border-gray-200 ml-4">
            {filteredKejadian.map((kejadian) => (
              <div key={kejadian.id} className="mb-8 ml-8">
                  <span className="absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600">
                      <AlertTriangle size={16}/>
                  </span>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                          <p className="font-bold text-gray-800">Kejadian Penting</p>
                          <time className="text-sm font-normal text-gray-500">{new Date(kejadian.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</time>
                      </div>
                      <div>
                          <p className="text-sm font-semibold text-gray-700">Uraian Kejadian:</p>
                          <p className="text-sm text-gray-600 mt-1">{kejadian.uraianKejadian}</p>
                      </div>
                      <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700">Penyelesaian:</p>
                          <p className="text-sm text-gray-600 mt-1">{kejadian.penyelesaian}</p>
                      </div>
                      {kejadian.sebabKejadian && (
                        <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700">Sebab/Keterangan:</p>
                            <p className="text-sm text-gray-600 mt-1">{kejadian.sebabKejadian}</p>
                        </div>
                      )}
                       <div className="flex justify-end gap-2 mt-4 border-t pt-3">
                          <Button variant="outline" className="text-xs p-2"><Edit2 size={14}/> Edit</Button>
                          <Button variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={14}/></Button>
                       </div>
                  </div>
              </div>
            ))}
            {filteredKejadian.length === 0 && (
              <div className="ml-8 text-center py-10 text-gray-500">
                  Tidak ada catatan kejadian yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}