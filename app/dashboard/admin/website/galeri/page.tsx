// Lokasi: alviansyahburhani/frontendkopmerahputih/frontendKopMerahPutih-2d28dba419adfcc919625f86c3f6e3cf404c0119/app/dashboard/admin/website/galeri/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef, ChangeEvent, FormEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { UploadCloud, Trash2, Loader2, ImagePlus, AlertTriangle, Edit, X, Save } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";

// --- [BARU] Impor service dan tipe data ---
import { adminService } from "@/services/admin.service";
import type { GalleryItem, ApiErrorResponse, UpdateGalleryItemDto } from "@/types/api.types";

// --- [BARU] Tipe data lokal untuk state upload ---
type UploadProgress = {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message: string;
};

// --- [BARU] Komponen Modal Edit ---
const EditModal = ({
  item,
  onClose,
  onSave,
}: {
  item: GalleryItem;
  onClose: () => void;
  onSave: (id: string, dto: UpdateGalleryItemDto) => Promise<void>;
}) => {
  const [description, setDescription] = useState(item.description || "");
  const [order, setOrder] = useState(item.order || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const dto: UpdateGalleryItemDto = {
      description: description || undefined,
      order: order ? Number(order) : undefined,
    };

    try {
      await onSave(item.id, dto);
      onClose(); // Tutup modal jika sukses
    } catch (err) {
      // Error toast sudah ditangani oleh onSave
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Edit Detail Gambar</h3>
            <Button variant="ghost" size="icon" type="button" onClick={onClose} disabled={loading}>
              <X size={20} />
            </Button>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative w-full h-48 rounded-md overflow-hidden bg-gray-100">
               <Image src={item.imageUrl} alt={item.description || "Preview"} layout="fill" objectFit="cover" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi (Opsional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full p-2 border rounded-lg"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Urut (Opsional)
              </label>
              <input
                id="order"
                type="number"
                className="w-full p-2 border rounded-lg"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="Angka lebih kecil tampil duluan"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" className="ml-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ===========================
// KOMPONEN UTAMA HALAMAN
// ===========================
export default function ManajemenGaleriPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State untuk modal edit
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // --- [BARU] Fungsi memuat data galeri ---
  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Memanggil service yang benar (dengan paginasi)
      const paginatedResult = await adminService.getAllGalleryItems(1, 500); // Ambil 500 item
      
      // Ambil array dari .data (INI ADALAH PERBAIKAN UTAMA)
      const dataArray = paginatedResult.data;

      // Sortir array-nya (sekarang ini akan berhasil)
      // Backend sudah mengurutkan, tapi kita bisa lakukan lagi di frontend jika perlu
      dataArray.sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        if (orderA !== orderB) {
          return orderA - orderB; // Urutan angka
        }
        // Jika order sama, urutkan berdasarkan tanggal
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setImages(dataArray);

    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = (apiError.message || 'Terjadi kesalahan').toString();
      setError(`Gagal memuat galeri: ${message}`);
      toast.error(`Gagal memuat galeri: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Memuat data saat mounted ---
  useEffect(() => {
    loadGallery();
  }, [loadGallery]);


  // --- [DIMODIFIKASI] Fungsi Hapus ---
  const handleHapus = async (id: string, description: string) => {
    const desc = description || `gambar ${id}`;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus foto "${desc}"?`)) {
      return;
    }

    const toastId = toast.loading('Menghapus gambar...');
    try {
      await adminService.deleteGalleryItem(id);
      toast.success('Gambar berhasil dihapus.', { id: toastId });
      setImages(prev => prev.filter(img => img.id !== id)); // Update UI
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal menghapus: ${apiError.message}`, { id: toastId });
    }
  };

  // --- [DIMODIFIKASI] Fungsi menangani upload file ---
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const files = Array.from(e.target.files);
    const initialUploads: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      status: 'pending',
      message: 'Menunggu...',
    }));
    setUploads(initialUploads);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploads(prev => prev.map((up, idx) =>
        idx === i ? { ...up, status: 'uploading', message: 'Mengunggah...' } : up
      ));

      try {
        // Upload hanya dengan file (sesuai UI, backend DTO opsional)
        const newImage = await adminService.uploadGalleryImage(file);
        
        // Tambahkan ke daftar (di atas)
        setImages(prev => [newImage, ...prev]); 
        
        setUploads(prev => prev.map((up, idx) =>
          idx === i ? { ...up, status: 'success', message: 'Berhasil' } : up
        ));
        toast.success(`Berhasil mengunggah: ${file.name}`);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        setUploads(prev => prev.map((up, idx) =>
          idx === i ? { ...up, status: 'error', message: apiError.message } : up
        ));
        toast.error(`Gagal mengunggah ${file.name}: ${apiError.message}`);
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTimeout(() => setUploads([]), 5000);
  };
  
  // --- [BARU] Fungsi Simpan Edit ---
  const handleSaveEdit = async (id: string, dto: UpdateGalleryItemDto) => {
    const toastId = toast.loading('Memperbarui deskripsi...');
    try {
      const updatedItem = await adminService.updateGalleryItem(id, dto);
      
      // Update state
      setImages(prevImages => 
        prevImages.map(img => img.id === id ? updatedItem : img)
      );
      toast.success('Berhasil diperbarui.', { id: toastId });
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal: ${apiError.message}`, { id: toastId });
      throw err; // Lempar error agar modal tidak tertutup
    }
  };


  // --- Skeleton (Dari file Anda) ---
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );
  
  // (Menggunakan skeleton asli Anda)
  const GaleriSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="w-full h-48 bg-gray-200">
                  <Skeleton className="w-full h-full" />
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
      <Toaster position="top-right" />
      {/* --- [BARU] Modal akan tampil jika editingItem bukan null --- */}
      {editingItem && (
        <EditModal 
          item={editingItem} 
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}
      
      <AdminPageHeader
        title="Manajemen Galeri Foto"
        description="Unggah dan kelola foto kegiatan untuk ditampilkan di landing page."
      />

      {/* --- [DIMODIFIKASI] Area Unggah Foto --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Unggah Foto Baru</h2>
        <div 
          className={clsx(
            "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center",
            "transition",
            uploads.length > 0 
              ? "cursor-not-allowed bg-gray-100"
              : "cursor-pointer hover:border-brand-red-500 hover:bg-red-50"
          )}
          onClick={() => !uploads.length && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center text-gray-500">
            {uploads.length > 0 ? (
              <Loader2 size={48} className="mb-4 text-gray-400 animate-spin"/>
            ) : (
              <UploadCloud size={48} className="mb-4 text-gray-400" />
            )}
            <p className="font-semibold">
              {uploads.length > 0 ? "Sedang mengunggah..." : "Seret & lepas file di sini"}
            </p>
            <p className="text-sm">atau</p>
            <Button 
              variant="outline" 
              className="mt-2 text-sm" 
              disabled={uploads.length > 0}
            >
              Pilih File
            </Button>
            <p className="text-xs text-gray-400 mt-4">PNG, JPG, WEBP</p>
            
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploads.length > 0}
            />
          </div>
        </div>
      </div>

      {/* --- [BARU] Daftar Progress Upload --- */}
      {uploads.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md border">
          <h3 className="font-semibold text-gray-800 mb-2">Proses Unggah</h3>
          <ul className="space-y-2">
            {uploads.map((up, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm">
                {up.status === 'pending' && <Loader2 size={16} className="text-gray-400 animate-spin" />}
                {up.status === 'uploading' && <Loader2 size={16} className="text-blue-500 animate-spin" />}
                {up.status === 'success' && <ImagePlus size={16} className="text-green-500" />}
                {up.status === 'error' && <AlertTriangle size={16} className="text-red-500" />}
                <span className="font-medium text-gray-700 truncate">{up.fileName}</span>
                <span className={clsx(
                  "text-xs",
                  up.status === 'success' && "text-green-600",
                  up.status === 'error' && "text-red-600",
                  up.status === 'pending' && "text-gray-500",
                  up.status === 'uploading' && "text-blue-600",
                )}>{up.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* --- [DIMODIFIKASI] Galeri yang Sudah Diunggah --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">Galeri Tersimpan</h2>
            {/* Filter Album Dihapus */}
          </div>

          {/* --- [BARU] Error Handling --- */}
          {error && (
            <div className="col-span-full text-center p-10 text-red-500">
               <AlertTriangle size={40} className="mx-auto mb-2" />
               <p className="font-semibold">Terjadi Kesalahan</p>
               <p>{error}</p>
            </div>
          )}

          {/* --- [DIMODIFIKASI] Tampilan Grid Foto --- */}
          {!error && images.length === 0 && (
            <div className="col-span-full text-center p-10 text-gray-500">
              <ImagePlus size={40} className="mx-auto mb-2" />
              <p className="font-semibold">Galeri Masih Kosong</p>
              <p>Silakan unggah foto baru menggunakan area di atas.</p>
            </div>
          )}
          
          {!error && images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((item) => (
                <div key={item.id} className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="relative w-full h-48">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.description || "Gambar Galeri"} 
                      layout="fill" 
                      objectFit="cover" 
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-white text-sm font-semibold line-clamp-2">
                        {item.description || "(Belum ada deskripsi)"}
                      </p>
                      <p className="text-xs text-gray-300">
                        Urutan: {item.order ?? "Otomatis"}
                      </p>
                      <div className="flex justify-end gap-2 mt-2">
                          <button 
                            title="Edit" 
                            onClick={() => setEditingItem(item)} // <-- Tombol Edit Baru
                            className="p-2 bg-white/20 text-white rounded-full hover:bg-blue-500"
                          >
                            <Edit size={16}/>
                          </button>
                          <button 
                            title="Hapus" 
                            onClick={() => handleHapus(item.id, item.description || "")} 
                            className="p-2 bg-white/20 text-white rounded-full hover:bg-red-500"
                          >
                            <Trash2 size={16}/>
                          </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}