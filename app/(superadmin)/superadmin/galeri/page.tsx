// Lokasi: frontend/app/(superadmin)/superadmin/galeri/page.tsx
"use client";

import { useState, useMemo, useEffect, useDeferredValue, useCallback } from "react";
import clsx from "clsx";
// Import komponen yang mungkin perlu dibuat/disesuaikan
// import SuperAdminPageHeader from "@/components/SuperAdminPageHeader"; // Contoh
import Button from "@/components/Button";
import { UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image"; // Import Image dari next/image

// --- Tipe Data Foto (Sama) ---
type Foto = {
  id: string;
  url: string;
  keterangan: string;
  album: 'Umum' | 'Kegiatan Platform' | 'Lainnya'; // Album bisa disesuaikan untuk global
  tanggalUnggah: string;
};

// --- Data Contoh (Ganti dengan fetch API ke backend global gallery) ---
const mockFotoGlobal: Foto[] = [
  { id: 'global-foto001', url: 'https://cdn.pixabay.com/photo/2017/08/18/11/04/hongkong-2654531_640.jpg', keterangan: 'Peluncuran Platform Koperasi Digital Merah Putih', album: 'Kegiatan Platform', tanggalUnggah: '2025-10-01' },
  { id: 'global-foto002', url: 'https://cdn.pixabay.com/photo/2019/04/16/18/13/media-4132399_640.jpg', keterangan: 'Tim Pengembang Sistem Koperasi ID', album: 'Umum', tanggalUnggah: '2025-09-20' },
];

export default function ManajemenGaleriGlobalPage() {
  const [filterAlbum, setFilterAlbum] = useState('');
  const [fotoList, setFotoList] = useState<Foto[]>([]); // State untuk data foto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setFotoList(mockFotoGlobal);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const deferredAlbum = useDeferredValue(filterAlbum);
  const filteredFoto = useMemo(() => {
    if (!deferredAlbum) return fotoList;
    return fotoList.filter(foto => foto.album === deferredAlbum);
  }, [deferredAlbum, fotoList]);

  const handleHapus = useCallback((id: string, keterangan: string) => {
      if(window.confirm(`Hapus foto global "${keterangan}"?`)){
          // TODO: Panggil API DELETE /global-gallery/{id}
          alert(`Simulasi: Foto "${keterangan}" dihapus.`);
          setFotoList(prev => prev.filter(f => f.id !== id)); // Update state
      }
  }, []);

  // TODO: Implementasi fungsi handleUpload jika diperlukan

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <Skeleton className="h-6 w-56 mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
       {/* Header Halaman */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><ImageIcon /> Manajemen Galeri Global</h1>
           <p className="mt-1 text-gray-600">Kelola foto yang tampil di landing page utama sistemkoperasi.id.</p>
        </div>
        {/* Tombol bisa ditambahkan di sini jika perlu */}
      </div>

      {/* Area Unggah Foto */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Unggah Foto Baru</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <div className="flex flex-col items-center text-gray-500">
                <UploadCloud size={48} className="mb-4 text-gray-400"/>
                <p className="font-semibold">Seret & lepas file di sini</p>
                <p className="text-sm">atau</p>
                <Button variant="outline" className="mt-2 text-sm border-gray-300 hover:border-blue-500 hover:text-blue-600">Pilih File</Button>
                <p className="text-xs text-gray-400 mt-4">PNG, JPG, GIF hingga 5MB</p>
            </div>
        </div>
      </div>

      {/* Galeri Tersimpan */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-700">Galeri Global Tersimpan</h2>
             <div className="flex items-center gap-2">
                <label htmlFor="filterAlbum" className="text-sm font-medium text-gray-600">Filter Album:</label>
                <select
                    id="filterAlbum"
                    value={filterAlbum}
                    onChange={(e) => setFilterAlbum(e.target.value)}
                    className="p-2 border rounded-lg text-sm bg-white"
                >
                    <option value="">Semua Album</option>
                    <option value="Umum">Umum</option>
                    <option value="Kegiatan Platform">Kegiatan Platform</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
             </div>
          </div>

          {/* Grid Foto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoto.length > 0 ? filteredFoto.map((foto) => (
              <div key={foto.id} className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="relative w-full h-48">
                  {/* Pastikan menggunakan komponen Image dari next/image */}
                  <Image src={foto.url} alt={foto.keterangan} layout="fill" objectFit="cover" />
                </div>
                {/* Overlay saat hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-white text-sm font-semibold line-clamp-2">{foto.keterangan}</p>
                    <p className="text-xs text-gray-300 mt-1">{new Date(foto.tanggalUnggah).toLocaleDateString('id-ID')}</p>
                    <div className="flex justify-end gap-2 mt-2">
                        <button title="Hapus" onClick={() => handleHapus(foto.id, foto.keterangan)} className="p-2 bg-white/20 text-white rounded-full hover:bg-red-500">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                </div>
              </div>
            )) : (
                <div className="col-span-full text-center p-10 text-gray-500">
                    Tidak ada foto dalam galeri global.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
