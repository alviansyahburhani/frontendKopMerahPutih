// Lokasi: frontend/app/dashboard/admin/website/kontak/page.tsx
"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Save, MapPin, Phone, Mail, Clock, Globe, NotebookPen } from "lucide-react";
import clsx from "clsx";

// --- Impor Tipe dan Service ---
import { CooperativeProfile, UpdateCooperativeProfileDto } from "@/types/api.types";
import { adminService } from "@/services/admin.service"; // Pastikan path ini benar
import toast from "react-hot-toast"; // Rekomendasi: Gunakan toast untuk notifikasi

export default function ManajemenKontakPage() {
  // Gunakan Partial<CooperativeProfile> agar state awal bisa kosong
  const [formData, setFormData] = useState<Partial<CooperativeProfile>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Mengambil Data dari API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Panggil service yang Anda buat
        const data = await adminService.getCooperativeProfile();
        setFormData(data);
      } catch (err) {
        console.error("Gagal mengambil profil koperasi:", err);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        toast.error("Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Handle Perubahan Input ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- Handle Simpan Data ke API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    toast.loading("Menyimpan perubahan...", { id: "saving" });

    // Siapkan data DTO sesuai yang ada di state
    const dataToUpdate: UpdateCooperativeProfileDto = {
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      operatingHours: formData.operatingHours,
      mapCoordinates: formData.mapCoordinates,
      website: formData.website,
      description: formData.description,
    };

    try {
      // Panggil service update
      const updatedProfile = await adminService.updateCooperativeProfile(dataToUpdate);
      setFormData(updatedProfile); // Update state dengan data terbaru dari server
      toast.success("Data kontak berhasil diperbarui!", { id: "saving" });
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
      toast.error("Gagal menyimpan perubahan.", { id: "saving" });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Skeleton (Tidak berubah, sudah bagus) ---
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const KontakSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 space-y-6">
          {/* Informasi Utama Section */}
          <fieldset className="space-y-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="w-full h-20 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
          </fieldset>
          {/* Lokasi & Media Sosial Section */}
          <fieldset className="space-y-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <div>
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
            </div>
          </fieldset>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );

  // --- Tampilan Loading atau Error ---
  if (loading) {
    return <KontakSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  // --- Tampilan Form (Telah Disesuaikan) ---
  return (
    <div>
      <AdminPageHeader
        title="Manajemen Info Kontak & Lokasi"
        description="Perbarui informasi yang tampil di halaman kontak dan footer website."
      />
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg">
        <div className="p-6 space-y-6">
          
          {/* --- Informasi Utama --- */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">Informasi Utama</legend>
            
            <div>
              <label htmlFor="address" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><MapPin size={16}/> Alamat Lengkap</label>
              <textarea 
                id="address" 
                name="address" // SESUAIKAN
                rows={3} 
                value={formData.address || ""} // SESUAIKAN
                onChange={handleChange} 
                className="w-full p-2 border rounded-lg block"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><NotebookPen size={16}/> Deskripsi Singkat Koperasi</label>
              <textarea 
                id="description" 
                name="description" // TAMBAH
                rows={3} 
                value={formData.description || ""} // TAMBAH
                onChange={handleChange} 
                className="w-full p-2 border rounded-lg block"
                placeholder="Deskripsi singkat tentang koperasi..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Phone size={16}/> Nomor Telepon</label>
                <input 
                  id="phone" 
                  name="phone" // SESUAIKAN
                  type="text" 
                  value={formData.phone || ""} // SESUAIKAN
                  onChange={handleChange} 
                  className="w-full p-2 border rounded-lg block"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Mail size={16}/> Alamat Email</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email || ""} 
                  onChange={handleChange} 
                  className="w-full p-2 border rounded-lg block"
                />
              </div>
            </div>
              
            <div>
              <label htmlFor="operatingHours" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Clock size={16}/> Jam Operasional</label>
              <input 
                id="operatingHours" 
                name="operatingHours" // SESUAIKAN
                type="text" 
                value={formData.operatingHours || ""} // SESUAIKAN
                onChange={handleChange} 
                className="w-full p-2 border rounded-lg block" 
                placeholder="Contoh: Senin – Jumat, 08.00 – 16.00"
              />
            </div>
          </fieldset>

          {/* --- Lokasi & Website --- */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">Lokasi & Website</legend>
            
            <div>
              <label htmlFor="website" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Globe size={16}/> Situs Web</label>
              <input 
                id="website" 
                name="website" // TAMBAH
                type="text" 
                value={formData.website || ""} // TAMBAH
                onChange={handleChange} 
                className="w-full p-2 border rounded-lg block"
                placeholder="Contoh: https://koperasi.id"
              />
            </div>
            
            <div>
              <label htmlFor="mapCoordinates" className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><MapPin size={16}/> Koordinat Peta (Latitude, Longitude)</label>
              <input 
                id="mapCoordinates" 
                name="mapCoordinates" // SESUAIKAN
                type="text" 
                value={formData.mapCoordinates || ""} // SESUAIKAN
                onChange={handleChange} 
                className="w-full p-2 border rounded-lg font-mono text-xs block"
              />
              <p className="text-xs text-gray-500 mt-1">Contoh: -5.13284, 119.45546 (Ambil dari URL Google Maps)</p>
            </div>

            {/* Input Media Sosial (Facebook, Instagram, Twitter) DIHAPUS 
                karena tidak ada field-nya di 'UpdateCooperativeProfileDto' backend.
            */}

          </fieldset>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-end">
            <Button type="submit" variant="primary" disabled={isSaving || loading}>
              <Save size={18}/> 
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
        </div>
      </form>
    </div>
  );
}