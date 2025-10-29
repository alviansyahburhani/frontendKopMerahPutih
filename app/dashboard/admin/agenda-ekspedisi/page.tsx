"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, ArrowLeftRight, X } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data ---
type Surat = {
  id: string;
  tanggal: string; // Tanggal surat diterima/dikirim
  nomorSurat: string;
  jenis: 'Masuk' | 'Keluar';
  asalAtauTujuan: string; // Bisa "Dari Siapa" atau "Kepada Siapa"
  perihal: string;
  fileUrl?: string; // URL scan surat
};

// --- Data Contoh ---
const mockSurat: Surat[] = [
  { id: 'sur001', tanggal: '2025-09-15', nomorSurat: '123/DISP/IX/2025', jenis: 'Masuk', asalAtauTujuan: 'Dinas Koperasi & UKM Kota Makassar', perihal: 'Undangan Sosialisasi Program 2026', fileUrl: '#' },
  { id: 'sur002', tanggal: '2025-09-14', nomorSurat: '005/KMP/IX/2025', jenis: 'Keluar', asalAtauTujuan: 'Seluruh Anggota', perihal: 'Pemberitahuan Jadwal Rapat Anggota', fileUrl: '#' },
  { id: 'sur003', tanggal: '2025-09-10', nomorSurat: '050/BANK-X/IX/2025', jenis: 'Masuk', asalAtauTujuan: 'Bank X Cabang Makassar', perihal: 'Penawaran Kerjasama Produk Pinjaman' },
  { id: 'sur004', tanggal: '2025-09-08', nomorSurat: '004/KMP/IX/2025', jenis: 'Keluar', asalAtauTujuan: 'Dinas Koperasi & UKM Kota Makassar', perihal: 'Permohonan Data Anggota Terbaru' },
];

export default function AgendaEkspedisiPage() {
  const [filters, setFilters] = useState({
    search: '',
    jenis: '',
  });
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuratList(mockSurat);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', jenis: '' });
  };

  const filteredSurat = useMemo(() => {
    return suratList.filter(surat => {
      const searchTerm = filters.search.toLowerCase();
      return (
        (surat.perihal.toLowerCase().includes(searchTerm) || surat.asalAtauTujuan.toLowerCase().includes(searchTerm) || surat.nomorSurat.toLowerCase().includes(searchTerm)) &&
        (filters.jenis === '' || surat.jenis === filters.jenis)
      );
    });
  }, [filters, suratList]);

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const AgendaSkeleton = () => (
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
          <Skeleton className="h-6 w-32 mb-6" />

          {/* Filter Area */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-28" /></th>
                  <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b text-sm">
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-8 w-20 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <AgendaSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Buku Agenda & Ekspedisi"
        description="Kelola dan arsipkan semua surat masuk dan surat keluar koperasi."
        actionButton={
            <div className="flex gap-2">
                <Button variant="outline">
                    <PlusCircle size={20} /><span>Catat Surat Masuk</span>
                </Button>
                <Button variant="primary">
                    <PlusCircle size={20} /><span>Catat Surat Keluar</span>
                </Button>
            </div>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Agenda & Ekspedisi
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
          <h2 className="text-lg font-bold text-gray-700">Riwayat Surat</h2>

          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Surat</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="No. Surat, Perihal, Asal/Tujuan..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Surat</label>
              <select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Masuk">Masuk</option>
                <option value="Keluar">Keluar</option>
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
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">No. Surat</th>
                  <th className="p-4 font-medium">Perihal</th>
                  <th className="p-4 font-medium">Asal / Tujuan</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurat.map((surat) => (
                  <tr key={surat.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-full ${surat.jenis === 'Masuk' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                <ArrowLeftRight size={14} />
                            </span>
                            <span>{new Date(surat.tanggal).toLocaleDateString('id-ID')}</span>
                        </div>
                    </td>
                    <td className="p-4 font-mono">{surat.nomorSurat}</td>
                    <td className="p-4 font-medium text-gray-800">{surat.perihal}</td>
                    <td className="p-4">{surat.asalAtauTujuan}</td>
                    <td className="p-4 text-center">
                      <a href={surat.fileUrl} download className="text-blue-600 hover:underline text-xs font-medium">
                        Lihat/Unduh
                      </a>
                    </td>
                  </tr>
                ))}
                {filteredSurat.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      Tidak ada data surat yang sesuai dengan filter.
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