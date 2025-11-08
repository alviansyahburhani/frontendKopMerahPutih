// GANTI SELURUH ISI FILE DENGAN KODE INI:
// Lokasi: frontendKopMerahPutih-main/app/(superadmin)/superadmin/settings/page.tsx

"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { superAdminService, UpdatePlatformSettingDto } from '@/services/superadmin.service';
import AdminPageHeader from '@/components/AdminPageHeader';
import { Upload, Save, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// Tipe untuk state pengaturan
type SettingsState = Record<string, string>;

// 1. FOKUS HANYA PADA HERO SECTION (sesuai permintaan)
const heroTextKeys = [
  { key: 'heroTitle', label: 'Judul Hero', placeholder: 'Misal: Koperasi Digital Modern' },
  { key: 'heroSubtitle', label: 'Subjudul Hero', placeholder: 'Misal: Bergabunglah bersama ribuan anggota lainnya...' },
];
const heroImageKey = 'heroImageUrl';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // File preview untuk gambar
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load data saat halaman dibuka
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        // Panggil service yang mengembalikan OBJEK { key: 'value', ... }
        const fetchedSettings = await superAdminService.getAllPlatformSettings();
        setSettings(fetchedSettings);
        
        // Set preview awal jika gambar sudah ada
        if (fetchedSettings[heroImageKey]) {
          setImagePreview(fetchedSettings[heroImageKey]);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
        toast.error(`Gagal memuat pengaturan: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Handler untuk input teks
  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handler untuk memilih file (hanya preview)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validasi frontend (sesuai backend)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Ukuran file terlalu besar! Maksimal 5 MB.');
        e.target.value = ''; // Reset input
        return;
      }
      
      setImageFile(file); // Simpan file untuk di-upload
      setImagePreview(URL.createObjectURL(file)); // Buat preview URL
    }
  };

  // Handler untuk "Simpan Perubahan" (teks dan gambar sekaligus)
  const handleSaveAll = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Menyimpan perubahan...');

    try {
      // 1. Upload gambar JIKA ada file baru
      if (imageFile) {
        toast.update(toastId, { render: 'Mengunggah gambar...' });
        
        const updatedSetting = await superAdminService.uploadPlatformSettingImage(
          heroImageKey, 
          imageFile
        );
        
        // Update state settings agar preview konsisten
        // 'updatedSetting.value' berisi URL baru dari server
        setSettings(prev => ({ ...prev, [heroImageKey]: updatedSetting.value }));
        setImageFile(null); // Hapus file dari antrian
      }

      // 2. Siapkan payload DTO untuk teks
      toast.update(toastId, { render: 'Menyimpan data teks...' });
      const textUpdates: UpdatePlatformSettingDto[] = heroTextKeys.map(({ key }) => ({
        key: key,
        value: settings[key] || ''
      }));

      // 3. Kirim pembaruan teks (backend Anda menerima array)
      await superAdminService.updateSettings(textUpdates);

      toast.update(toastId, { 
        render: 'Semua perubahan berhasil disimpan!', 
        type: 'success', 
        isLoading: false, 
        autoClose: 5000 
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error';
      // Cek jika ini error DTO dari upload
      if (errorMessage.includes('400')) {
        toast.update(toastId, { 
          render: `Gagal menyimpan: Error 400. Pastikan service 'key' sudah benar.`, 
          type: 'error', 
          isLoading: false, 
          autoClose: 5000 
        });
      } else {
         toast.update(toastId, { 
          render: `Gagal menyimpan: ${errorMessage}`, 
          type: 'error', 
          isLoading: false, 
          autoClose: 5000 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <AdminPageHeader
          title="Pengaturan Hero Section"
          description="Atur konten dinamis untuk halaman utama (portal) Anda."
        />
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  // 4. DESAIN BARU: JSX yang lebih modern
  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminPageHeader
        title="Pengaturan Hero Section"
        description="Atur konten dinamis untuk halaman utama (portal) Anda."
      />

      {/* --- KITA FOKUSKAN SEMUA DALAM SATU FORM --- */}
      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow space-y-8">
          
          {/* --- BAGIAN KONTEN TEKS --- */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Konten Teks Hero</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ini akan mengubah judul dan subjudul di halaman depan utama.
            </p>
            <div className="mt-6 space-y-4">
              {heroTextKeys.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name={key}
                      id={key}
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-red-500 focus:ring-brand-red-500 sm:text-sm"
                      value={settings[key] || ''}
                      placeholder={placeholder}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* --- BAGIAN GAMBAR --- */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gambar Hero</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ganti gambar latar belakang. (Maks 5MB, .jpg, .png, .webp, .svg)
            </p>
            
            {/* Pratinjau Gambar */}
            <div className="mt-4 w-full aspect-video rounded-md bg-gray-100 overflow-hidden flex items-center justify-center relative border">
              {imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Hero preview" 
                  className="w-full h-full object-cover"
                  fill={true}
                  priority
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={48} />
                  <p>Belum ada gambar</p>
                </div>
              )}
            </div>

            {/* Tombol Upload */}
            <div className="mt-4">
              <label 
                htmlFor="hero-image-upload" 
                className={`cursor-pointer inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-red-500 focus:ring-offset-2 ${isSaving ? 'opacity-50' : ''}`}
              >
                <Upload size={16} />
                {imageFile ? `File: ${imageFile.name}` : 'Pilih File Baru...'}
                <input 
                  id="hero-image-upload" 
                  name="hero-image-upload" 
                  type="file" 
                  className="sr-only"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileChange}
                  disabled={isSaving}
                />
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(settings[heroImageKey] || null); // Kembali ke gambar tersimpan
                  }}
                  className="ml-3 text-sm text-gray-500 hover:text-red-600"
                  disabled={isSaving}
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* --- TOMBOL SIMPAN UTAMA --- */}
          <div className="mt-8 border-t pt-6">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-brand-red-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-red-700 focus:outline-none focus:ring-2 focus:ring-brand-red-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Hero'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}