// Lokasi: frontend/app/dashboard/admin/website/galeri/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { UploadCloud, Trash2 } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

// --- Tipe Data ---
type Foto = {
  id: string;
  url: string;
  keterangan: string;
  album: 'RAT' | 'Kegiatan Sosial' | 'Lainnya';
  tanggalUnggah: string;
};

// --- Data Contoh ---
const mockFoto: Foto[] = [
  { id: 'foto001', url: 'https://cdn.pixabay.com/photo/2023/02/14/23/49/woman-7790612_1280.jpg', keterangan: 'Penyerahan SHU secara simbolis saat RAT 2025.', album: 'RAT', tanggalUnggah: '2025-03-16' },
  { id: 'foto002', url: 'https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg', keterangan: 'Peserta Rapat Anggota Tahunan 2025.', album: 'RAT', tanggalUnggah: '2025-03-16' },
  { id: 'foto003', url: 'https://cdn.pixabay.com/photo/2019/04/16/18/13/media-4132399_640.jpg', keterangan: 'Kegiatan bakti sosial di panti asuhan.', album: 'Kegiatan Sosial', tanggalUnggah: '2025-08-17' },
  { id: 'foto004', url: 'https://cdn.pixabay.com/photo/2017/07/13/20/24/news-2501786_640.jpg', keterangan: 'Peresmian unit usaha toko sembako.', album: 'Lainnya', tanggalUnggah: '2025-02-20' },
  { id: 'foto005', url: 'https://cdn.pixabay.com/photo/2017/08/18/11/04/hongkong-2654531_640.jpg', keterangan: 'Foto bersama pengurus dan pengawas periode baru.', album: 'RAT', tanggalUnggah: '2025-03-17' },
];

export default function ManajemenGaleriPage() {
  const [filterAlbum, setFilterAlbum] = useState('');
  const [fotoList, setFotoList] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setFotoList(mockFoto);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredFoto = useMemo(() => {
    if (!filterAlbum) return fotoList;
    return fotoList.filter(foto => foto.album === filterAlbum);
  }, [filterAlbum, fotoList]);
  
  const handleHapus = (keterangan: string) => {
      if(window.confirm(`Apakah Anda yakin ingin menghapus foto "${keterangan}"?`)){
          alert(`Simulasi: Foto "${keterangan}" telah dihapus.`);
      }
  }

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const GaleriSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Skeleton className="h-12 w-12 mx-auto mb-4" />
          <Skeleton className="h-4 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto mb-2" />
          <Skeleton className="h-8 w-28 mx-auto mt-2" />
          <Skeleton className="h-3 w-40 mx-auto mt-4" />
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Grid of photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-3 w-3/4 mb-2" />
                  <div className="flex justify-end gap-2 mt-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
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
    return <GaleriSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Galeri Foto"
        description="Unggah dan kelola foto kegiatan untuk ditampilkan di landing page."
      />

      {/* --- Area Unggah Foto --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Unggah Foto Baru</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-red-500 hover:bg-red-50 transition">
            <div className="flex flex-col items-center text-gray-500">
                <UploadCloud size={48} className="mb-4 text-gray-400"/>
                <p className="font-semibold">Seret & lepas file di sini</p>
                <p className="text-sm">atau</p>
                <Button variant="outline" className="mt-2 text-sm">Pilih File</Button>
                <p className="text-xs text-gray-400 mt-4">PNG, JPG, GIF hingga 10MB</p>
            </div>
        </div>
      </div>
      
      {/* --- Galeri yang Sudah Diunggah --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-700">Galeri Tersimpan</h2>
             <div className="flex items-center gap-2">
                <label htmlFor="filterAlbum" className="text-sm font-medium text-gray-600">Filter Album:</label>
                <select 
                    id="filterAlbum" 
                    value={filterAlbum} 
                    onChange={(e) => setFilterAlbum(e.target.value)}
                    className="p-2 border rounded-lg text-sm"
                >
                    <option value="">Semua Album</option>
                    <option value="RAT">RAT</option>
                    <option value="Kegiatan Sosial">Kegiatan Sosial</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
             </div>
          </div>

          {/* --- Tampilan Grid Foto --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoto.map((foto) => (
              <div key={foto.id} className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="relative w-full h-48">
                  <Image src={foto.url} alt={foto.keterangan} layout="fill" objectFit="cover" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-white text-sm font-semibold line-clamp-2">{foto.keterangan}</p>
                    <div className="flex justify-end gap-2 mt-2">
                        <button title="Hapus" onClick={() => handleHapus(foto.keterangan)} className="p-2 bg-white/20 text-white rounded-full hover:bg-red-500">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                </div>
              </div>
            ))}
            {filteredFoto.length === 0 && (
              <div className="col-span-full text-center p-10 text-gray-500">
                  Tidak ada foto dalam album ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}