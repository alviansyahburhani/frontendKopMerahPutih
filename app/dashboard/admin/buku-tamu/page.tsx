// Lokasi: frontend/app/dashboard/admin/buku-tamu/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Search, Trash2, CheckSquare, X } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data ---
type BukuTamuEntry = {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  nama: string;
  asal: 'Anggota' | 'Tamu Publik';
  pesan: string;
  status: 'Baru' | 'Sudah Ditanggapi';
};

// --- Data Contoh ---
const mockBukuTamu: BukuTamuEntry[] = [
  { id: 'bt001', tanggal: '2025-09-15', nama: 'Rahmat Hidayat', asal: 'Tamu Publik', pesan: 'Saya tertarik untuk bergabung dengan koperasi ini. Bagaimana prosedurnya?', status: 'Baru' },
  { id: 'bt002', tanggal: '2025-09-14', nama: 'Alviansyah Burhani', asal: 'Anggota', pesan: 'Terima kasih atas pelayanannya. Proses pinjaman saya kemarin berjalan lancar.', status: 'Sudah Ditanggapi' },
  { id: 'bt003', tanggal: '2025-09-12', nama: 'Dewi Anggraini', asal: 'Anggota', pesan: 'Apakah ada rencana untuk mengadakan pelatihan kewirausahaan untuk anggota?', status: 'Baru' },
  { id: 'bt004', tanggal: '2025-09-10', nama: 'Pengunjung Website', asal: 'Tamu Publik', pesan: 'Saya ingin tahu lebih lanjut tentang produk simpanan sukarela.', status: 'Sudah Ditanggapi' },
];


export default function BukuTamuPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [entriesList, setEntriesList] = useState<BukuTamuEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntriesList(mockBukuTamu);
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

  const filteredEntries = useMemo(() => {
    return entriesList.filter(entry => {
      return (
        entry.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.status === '' || entry.status === filters.status)
      );
    });
  }, [entriesList, filters]);

  const handleAction = (nama: string, action: 'tanggapi' | 'hapus') => {
    const message = action === 'tanggapi'
      ? `Apakah Anda yakin ingin menandai pesan dari &quot;${nama}&quot; sebagai sudah ditanggapi?`
      : `Apakah Anda yakin ingin menghapus pesan dari &quot;${nama}&quot;?`;

    if (window.confirm(message)) {
      alert(`Simulasi: Aksi &quot;${action}&quot; untuk pesan dari &quot;${nama}&quot; berhasil.`);
    }
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

          {/* Filter Section */}
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

          {/* Entries List */}
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
      <AdminPageHeader
        title="Buku Tamu"
        description="Kelola pesan, saran, dan pertanyaan yang masuk dari anggota dan publik."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KODE KOP SURAT DITAMBAHKAN DI SINI --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Tamu
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            {/* Kolom Kiri */}
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
            {/* Kolom Kanan */}
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

          {/* --- Area Filter --- */}
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
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-red-300 transition">
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
                <div className="flex justify-end gap-2 mt-4">
                  {entry.status === 'Baru' && (
                    <Button onClick={() => handleAction(entry.nama, 'tanggapi')} variant="outline" className="text-xs px-3 py-1">
                      <CheckSquare size={14} /> Tandai Sudah Ditanggapi
                    </Button>
                  )}
                  <Button onClick={() => handleAction(entry.nama, 'hapus')} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={14} /> Hapus
                  </Button>
                </div>
              </div>
            ))}
             {filteredEntries.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    Tidak ada pesan yang sesuai dengan filter.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}