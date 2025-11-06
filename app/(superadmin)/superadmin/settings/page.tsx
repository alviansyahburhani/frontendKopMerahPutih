// GANTI SELURUH ISI FILE DENGAN KODE INI:
// Lokasi: frontendKopMerahPutih-main/app/(superadmin)/superadmin/settings/page.tsx

"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { toast } from 'react-toastify'; // <-- 1. PERBAIKI IMPOR: Gunakan react-toastify
import { superAdminService, UpdatePlatformSettingDto } from '@/services/superadmin.service';
import AdminPageHeader from '@/components/AdminPageHeader';
import { Upload, Save } from 'lucide-react'; // <-- Tambahkan ikon Save
import Image from 'next/image';

// Tipe untuk state pengaturan
type SettingsState = Record<string, string>;

// Daftar pengaturan yang kita inginkan
// (Kunci ini harus SAMA PERSIS dengan 'key' di database)
const settingKeys = [
  { key: 'namaPlatform', label: 'Nama Platform' },
  { key: 'heroTitle', label: 'Judul Hero Landing Page' },
  { key: 'heroSubtitle', label: 'Subjudul Hero Landing Page' },
  { key: 'promoTitle', label: 'Judul Bagian Promosi' },
  { key: 'promoSubtitle', label: 'Subjudul Bagian Promosi' },
];

// Key untuk gambar
const heroImageKey = 'heroImageUrl';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({});
  const [loading, setLoading] = useState(true);
  const [isSavingText, setIsSavingText] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load data saat halaman dibuka
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        // Panggil service yang mengambil SEMUA settings
        const fetchedSettings: Record<string, string> = await superAdminService.getAllPlatformSettings();

        

        setSettings(fetchedSettings);
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

  // 2. DESAIN BARU: Fungsi untuk menyimpan SEMUA pengaturan teks sekaligus
  const handleSaveAllTextSettings = async () => {
    setIsSavingText(true);
    const toastId = toast.loading('Menyimpan pengaturan teks...'); // <-- 3. FEEDBACK JELAS

    try {
      // Buat payload array sesuai DTO backend
      const updates: UpdatePlatformSettingDto[] = settingKeys.map(({ key }) => ({
        key: key,
        value: settings[key] || '' // Kirim string kosong jika tidak diisi
      }));

      // Panggil service 'updateSettings' (PATCH /admin/platform-settings)
      await superAdminService.updateSettings(updates);

      // Gunakan toast.update untuk notifikasi 'react-toastify'
      toast.update(toastId, {
        render: 'Pengaturan berhasil disimpan!',
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error';
      toast.update(toastId, {
        render: `Gagal menyimpan: ${errorMessage}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSavingText(false);
    }
  };

  // Handler untuk upload gambar (sudah menggunakan toastify)
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingImage(true);
      const toastId = toast.loading('Mengunggah gambar hero...'); // <-- 3. FEEDBACK JELAS

      try {
        // Panggil service upload (POST /admin/platform-settings/upload-image)
        const updatedSetting = await superAdminService.uploadPlatformSettingImage(heroImageKey, file);

        // Update state lokal dengan URL gambar baru dari server
        setSettings(prev => ({ ...prev, [heroImageKey]: updatedSetting.value }));

        toast.update(toastId, {
          render: 'Gambar hero berhasil diperbarui!',
          type: 'success',
          isLoading: false,
          autoClose: 5000
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error';
        toast.update(toastId, {
          render: `Gagal mengunggah: ${errorMessage}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <AdminPageHeader
          title="Pengaturan Platform"
          description="Atur tampilan dan data global untuk landing page utama."
        />
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  // 4. DESAIN BARU: JSX yang lebih modern
  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminPageHeader
        title="Pengaturan Platform"
        description="Atur tampilan dan data global untuk landing page utama."
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Kolom Pengaturan Teks */}
        <div className="bg-white p-6 rounded-lg shadow space-y-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">Konten Landing Page</h3>

          <div className="flex-1 space-y-4">
            {settingKeys.map(({ key, label }) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <div className="mt-1">
                  {/* Input full-width yang lebih bersih */}
                  <input
                    type="text"
                    name={key}
                    id={key}
                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-red-500 focus:ring-brand-red-500 sm:text-sm"
                    value={settings[key] || ''} // <-- Data sekarang akan muncul di sini
                    onChange={handleTextChange}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tombol simpan tunggal di bagian bawah card */}
          <div className="mt-6 border-t pt-4">
            <button
              type="button"
              onClick={handleSaveAllTextSettings}
              disabled={isSavingText}
              className="inline-flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-brand-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-red-700 focus:outline-none focus:ring-2 focus:ring-brand-red-500 focus:ring-offset-2 disabled:bg-gray-300"
            >
              <Save size={16} />
              {isSavingText ? 'Menyimpan...' : 'Simpan Perubahan Teks'}
            </button>
          </div>
        </div>

        {/* Kolom Pengaturan Gambar */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Gambar Hero</h3>

          <div className="w-full">
            <p className="block text-sm font-medium text-gray-700 mb-2">Pratinjau Gambar Hero</p>
            {/* Menggunakan <Image> dari next/image */}
            <div className="w-full aspect-video rounded-md bg-gray-100 overflow-hidden flex items-center justify-center relative">
              {settings[heroImageKey] ? (
                <Image
                  src={settings[heroImageKey]}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                  fill={true}
                  priority
                />
              ) : (
                <span className="text-gray-400">Belum ada gambar</span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="hero-image-upload" className="block text-sm font-medium text-gray-700">
              Ganti Gambar Hero (.jpg, .png, .webp)
            </label>
            <div className="mt-1 flex items-center">
              <label
                htmlFor="hero-image-upload"
                className={`cursor-pointer inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-red-500 focus:ring-offset-2 ${isUploadingImage ? 'opacity-50' : ''}`}
              >
                <Upload size={16} />
                {isUploadingImage ? 'Mengunggah...' : 'Pilih File'}
                <input
                  id="hero-image-upload"
                  name="hero-image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  disabled={isUploadingImage}
                />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}