// Lokasi: frontend/app/dashboard/admin/saran-anggota/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Search, Trash2, X, Lightbulb } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data ---
type SaranAnggota = {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  anggota: {
    id: string;
    nama: string;
  };
  judul: string;
  isiSaran: string;
  status: 'Baru' | 'Dipertimbangkan' | 'Selesai';
};

// --- Data Contoh ---
const mockSaran: SaranAnggota[] = [
  { id: 'srn001', tanggal: '2025-09-15', anggota: { id: 'agt002', nama: 'Budi Santoso' }, judul: 'Pengadaan Mesin Kopi di Kantor', isiSaran: 'Akan sangat bagus jika koperasi bisa menyediakan mesin kopi sederhana di ruang tunggu untuk anggota yang sedang antri. Bisa meningkatkan kenyamanan.', status: 'Dipertimbangkan' },
  { id: 'srn002', tanggal: '2025-09-11', anggota: { id: 'agt001', nama: 'Alviansyah Burhani' }, judul: 'Program Cicilan untuk Barang Elektronik', isiSaran: 'Bagaimana jika koperasi membuka unit usaha baru untuk cicilan barang elektronik seperti HP atau laptop? Saya rasa peminatnya akan banyak.', status: 'Baru' },
  { id: 'srn003', tanggal: '2025-08-20', anggota: { id: 'agt003', nama: 'Citra Lestari' }, judul: 'Jadwal Pelayanan Hari Sabtu', isiSaran: 'Saran saya agar pelayanan koperasi bisa buka setengah hari pada hari Sabtu, karena banyak anggota yang bekerja dan baru sempat mengurus di akhir pekan. Terima kasih.', status: 'Selesai' },
];


export default function SaranAnggotaPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [saranList, setSaranList] = useState<SaranAnggota[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaranList(mockSaran);
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

  const filteredSaran = useMemo(() => {
    return saranList.filter(saran => {
      return (
        (saran.anggota.nama.toLowerCase().includes(filters.search.toLowerCase()) || saran.judul.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.status === '' || saran.status === saran.status)
      );
    });
  }, [saranList, filters]);

  const handleAction = (nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus saran dari "${nama}"?`)) {
      alert(`Simulasi: Saran dari "${nama}" telah dihapus.`);
    }
  };

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const SaranAnggotaSkeleton = () => (
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

          {/* Filter Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
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

          {/* Entries List */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-64 mt-1" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mt-3" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </div>
                <div className="flex justify-end gap-2 p-3 bg-gray-50/50 border-t rounded-b-lg">
                  <Skeleton className="h-8 w-24" />
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
    return <SaranAnggotaSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Buku Saran Anggota"
        description="Kelola semua masukan, ide, dan saran dari para anggota koperasi."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Saran Anggota
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
          <h2 className="text-lg font-bold text-gray-700">Daftar Saran Masuk</h2>

          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota / Judul</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Nama atau judul saran..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status Saran</label>
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Baru">Baru</option>
                <option value="Dipertimbangkan">Dipertimbangkan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredSaran.map((saran) => (
              <div key={saran.id} className="border border-gray-200 rounded-lg bg-white hover:bg-red-200 transition">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-brand-red-700 text-base">{saran.judul}</p>
                            <p className="text-xs text-gray-500 mt-1">
                            Dari: <span className="font-medium">{saran.anggota.nama}</span> | {new Date(saran.tanggal).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            saran.status === 'Baru' ? 'bg-yellow-100 text-yellow-700' :
                            saran.status === 'Dipertimbangkan' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                            {saran.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-3 border-l-4 border-gray-200 pl-4">
                        {saran.isiSaran}
                    </p>
                </div>
                <div className="flex justify-end gap-2 p-3 bg-gray-50/50 border-t rounded-b-lg">
                  {/* Di sini Anda bisa menambahkan dropdown untuk mengubah status */}
                  <Button variant="outline" className="text-xs px-3 py-1"><Lightbulb size={14} /> Ubah Status</Button>
                  <Button onClick={() => handleAction(saran.anggota.nama)} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={14} /> Hapus
                  </Button>
                </div>
              </div>
            ))}
             {filteredSaran.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    Tidak ada saran yang sesuai dengan filter.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}