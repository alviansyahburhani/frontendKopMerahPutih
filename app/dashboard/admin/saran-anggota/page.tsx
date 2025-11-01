// Lokasi: frontend/app/dashboard/admin/saran-anggota/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Search, Trash2, X, Lightbulb, MessageSquare, CheckCircle, User } from "lucide-react";
import clsx from "clsx";
// 1. Impor service, toast, dan tipe data
import toast, { Toaster } from 'react-hot-toast';
import { adminService, MemberSuggestionResponse, RespondSuggestionDto } from '@/services/admin.service';
import { ApiErrorResponse } from '@/types/api.types';


// --- 2. Tipe Data (Dimodifikasi) ---
// Tipe ini di-mapping dari MemberSuggestionResponse agar sesuai tampilan
type MappedSaran = {
  id: string;
  tanggal: string; // dari createdAt
  anggotaNama: string; // dari member.fullName
  anggotaAlamat: string; // dari member.address
  isiSaran: string; // dari suggestion
  status: 'Baru' | 'Selesai'; // Disederhanakan dari 3 status menjadi 2
  response: string | null; // dari response
  responderName: string | null; // dari responseByUser.fullName
};

// --- Data Contoh Dihapus ---
// const mockSaran: SaranAnggota[] = [ ... ];


export default function SaranAnggotaPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '', // Akan diisi 'Baru' atau 'Selesai'
  });
  const [saranList, setSaranList] = useState<MappedSaran[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Mengambil data dari API
  useEffect(() => {
    const loadSaran = async () => {
      setLoading(true);
      try {
        const dataFromApi = await adminService.getMemberSuggestions();
        
        // Mapping data backend ke tipe frontend
        const mappedData: MappedSaran[] = dataFromApi.map(entry => ({
          id: entry.id,
          tanggal: entry.createdAt,
          anggotaNama: entry.member?.fullName || 'Anggota Anonim',
          anggotaAlamat: entry.member?.address || 'Alamat tidak ada',
          isiSaran: entry.suggestion,
          status: entry.response ? 'Selesai' : 'Baru', // Logika 2 status
          response: entry.response,
          responderName: entry.responseByUser?.fullName || null,
        }));
        
        // Urutkan dari yang terbaru
        mappedData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        
        setSaranList(mappedData);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        toast.error(`Gagal memuat saran: ${apiError.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadSaran();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', status: '' });
  };

  const filteredSaran = useMemo(() => {
    return saranList.filter(saran => {
      // Filter berdasarkan nama anggota atau isi saran
      const searchMatch = (
        saran.anggotaNama.toLowerCase().includes(filters.search.toLowerCase()) || 
        saran.isiSaran.toLowerCase().includes(filters.search.toLowerCase())
      );
      // Filter berdasarkan status (dengan perbaikan bug)
      const statusMatch = (filters.status === '' || saran.status === filters.status);
      
      return searchMatch && statusMatch;
    });
  }, [saranList, filters]);

  // 4. Fungsi Hapus (DELETE)
  const handleDelete = (id: string, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus saran dari "${nama}"?`)) return;

    const promise = adminService.deleteMemberSuggestion(id);
    
    toast.promise(promise, {
      loading: 'Menghapus saran...',
      success: () => {
        // Update state secara lokal
        setSaranList(prev => prev.filter(item => item.id !== id));
        return 'Saran berhasil dihapus.';
      },
      error: (err: ApiErrorResponse) => `Gagal menghapus: ${err.message}`,
    });
  };

  // 5. Fungsi Tanggapi (RESPOND)
  const handleRespond = (id: string, nama: string, currentSuggestion: string) => {
    const responseText = window.prompt(
      `Menanggapi Saran dari: ${nama}\n\nSaran:\n"${currentSuggestion}"\n\nTulis tanggapan Anda:`
    );

    if (responseText && responseText.trim() !== "") {
      const dto: RespondSuggestionDto = { response: responseText.trim() };
      const promise = adminService.respondToSuggestion(id, dto);

      toast.promise(promise, {
        loading: 'Mengirim tanggapan...',
        success: (updatedEntry) => {
          // Update state secara lokal
          setSaranList(prev =>
            prev.map(item =>
              item.id === id
                ? {
                    ...item,
                    response: updatedEntry.response,
                    responderName: updatedEntry.responseByUser?.fullName || 'Admin',
                    status: 'Selesai', // Ubah status
                  }
                : item
            )
          );
          return 'Tanggapan berhasil dikirim.';
        },
        error: (err: ApiErrorResponse) => `Gagal mengirim: ${err.message}`,
      });
    } else if (responseText !== null) { // User klik OK tapi input kosong
      toast.error("Tanggapan tidak boleh kosong.");
    }
  };

  // --- Skeleton (Tidak Berubah) ---
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );
  // ( ... sisa kode Skeleton ... )
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
      {/* 6. Tambahkan Toaster */}
      <Toaster position="top-right" />
      
      <AdminPageHeader
        title="Buku Saran Anggota"
        description="Kelola semua masukan, ide, dan saran dari para anggota koperasi."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT (Tidak Berubah) --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Saran Anggota
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            {/* ... (Isi Kop Surat) ... */}
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

          {/* --- Area Filter (Dimodifikasi) --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota / Isi Saran</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Nama atau isi saran..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status Saran</label>
              {/* Status 'Dipertimbangkan' dihapus agar sesuai backend */}
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Baru">Baru</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* 7. JSX Rendering (Dimodifikasi) */}
            {filteredSaran.map((saran) => (
              <div key={saran.id} className="border border-gray-200 rounded-lg bg-white shadow-sm transition">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            {/* Judul dihapus, diganti langsung ke isiSaran */}
                            <p className="text-xs text-gray-500 mt-1">
                              Dari: <span className="font-medium text-gray-700">{saran.anggotaNama}</span> ({saran.anggotaAlamat})
                              <br/>
                              Tanggal: {new Date(saran.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            saran.status === 'Baru' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                            {saran.status}
                        </span>
                    </div>
                    {/* Menampilkan isiSaran (suggestion dari backend) */}
                    <p className="text-sm font-semibold text-gray-800 mt-3 border-l-4 border-gray-200 pl-4">
                        {saran.isiSaran}
                    </p>

                    {/* Menampilkan Tanggapan Admin jika ada */}
                    {saran.response && (
                      <div className="mt-4 pt-4 border-t border-dashed">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          Tanggapan dari {saran.responderName || 'Admin'}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 italic border-l-4 border-green-200 pl-4">
                          &quot;{saran.response}&quot;
                        </p>
                      </div>
                    )}
                </div>
                
                {/* Tombol Aksi (Dimodifikasi) */}
                <div className="flex justify-end gap-2 p-3 bg-gray-50/50 border-t rounded-b-lg">
                  {saran.status === 'Baru' && (
                    <Button onClick={() => handleRespond(saran.id, saran.anggotaNama, saran.isiSaran)} variant="default" className="text-xs px-3 py-1">
                      <MessageSquare size={14} /> Tanggapi
                    </Button>
                  )}
                  <Button onClick={() => handleDelete(saran.id, saran.anggotaNama)} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={14} /> Hapus
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredSaran.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    {saranList.length === 0 ? "Belum ada saran masuk." : "Tidak ada saran yang sesuai dengan filter."}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}