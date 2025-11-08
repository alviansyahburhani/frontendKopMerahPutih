'use client';

import React, { useState, useEffect } from 'react';
import { superAdminService, UpdatePlatformSettingDto } from '@/services/superadmin.service';
import Button from '@/components/Button';
import { ImageSettingUploader } from '@/components/admin/ImageSettingUploader';
import QuoteFader from '@/components/QuoteFader';
import { toast, Toaster } from 'react-hot-toast';

type SettingsState = Record<string, string | null>;

// ==========================================================
// PERBAIKAN BUG "SATU HURUF":
// Komponen InputSetting dan QuoteSetting dipindahkan ke LUAR
// fungsi PlatformSettingsPage.
// ==========================================================

// Tipe untuk props helper component
type InputSettingProps = {
  name: string;
  label: string;
  as?: 'input' | 'textarea';
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

/**
 * Helper component untuk input teks.
 * Didefinisikan di luar agar tidak re-render & kehilangan fokus.
 */
const InputSetting: React.FC<InputSettingProps> = ({ name, label, as = 'input', value, onChange }) => {
  const Component = as;
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Component
        id={name}
        name={name}
        value={value ?? ''} // Tampilkan string kosong jika null
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        rows={as === 'textarea' ? 4 : undefined}
      />
    </div>
  );
};

/**
 * Helper component untuk grup input Quote.
 * Didefinisikan di luar agar tidak re-render & kehilangan fokus.
 */
const QuoteSetting = ({ baseKey, valueText, valueAuthor, onChange }: { 
  baseKey: string, 
  valueText: string | null, 
  valueAuthor: string | null,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void 
}) => (
  <div className="border p-3 rounded-md mb-2">
    <InputSetting 
      name={`${baseKey}Text`} 
      label="Teks Kutipan" 
      as="textarea" 
      value={valueText}
      onChange={onChange}
    />
    <InputSetting 
      name={`${baseKey}Author`} 
      label="Author Kutipan" 
      value={valueAuthor}
      onChange={onChange}
    />
  </div>
);


// ==========================================================
// Komponen Halaman Utama
// ==========================================================
export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({});
  const [originalSettings, setOriginalSettings] = useState<SettingsState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await superAdminService.getAllPlatformSettings();
        setSettings(data);
        setOriginalSettings(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil pengaturan platform.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Fungsi handleChange sekarang akan diteruskan sebagai prop
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadSuccess = (key: string, newUrl: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: newUrl,
    }));
    setOriginalSettings((prev) => ({
      ...prev,
      [key]: newUrl,
    }));
    toast.success('Gambar berhasil diunggah dan tersimpan!');
  };

  const handleSave = async () => {
    setSaving(true);

    const changedSettings: UpdatePlatformSettingDto[] = [];
    Object.keys(settings).forEach((key) => {
      if (settings[key] !== originalSettings[key]) {
        changedSettings.push({ 
          key, 
          value: settings[key] ?? ''
        });
      }
    });

    if (changedSettings.length === 0) {
      toast.success('Tidak ada perubahan untuk disimpan.');
      setSaving(false);
      return;
    }

    try {
      await superAdminService.updateSettings(changedSettings);
      setOriginalSettings(settings);
      toast.success('Pengaturan berhasil disimpan!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Memuat pengaturan...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pengaturan Platform</h1>
      </div>

      {/* --- BAGIAN HERO --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Bagian Hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputSetting 
              name="heroTitle" 
              label="Judul Hero" 
              value={settings.heroTitle ?? null}
              onChange={handleChange}
            />
            <InputSetting 
              name="heroSubtitle" 
              label="Subjudul Hero" 
              as="textarea" 
              value={settings.heroSubtitle ?? null}
              onChange={handleChange}
            />
          </div>
          <div>
            <ImageSettingUploader
              label="Gambar Latar Hero"
              settingKey="heroImageUrl"
              currentImageUrl={settings.heroImageUrl ?? null}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      </div>

      {/* === SECTION BARU (DENGAN PERBAIKAN + GAMBAR) === */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Bagian Fondasi (Setelah Hero)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Konten Kiri: Teks + Quotes */}
          <div className="space-y-4">
            <InputSetting 
              name="section2Title" 
              label="Judul Bagian 2"
              as="textarea"
              value={settings.section2Title ?? null}
              onChange={handleChange}
            />
            <InputSetting 
              name="section2Subtitle" 
              label="Subjudul Bagian 2" 
              as="textarea" 
              value={settings.section2Subtitle ?? null}
              onChange={handleChange}
            />
            
            <div className="mt-4 border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Pratinjau Teks:</h3>
              <h4 className="text-xl font-bold text-gray-900">
                {settings.section2Title || "Membangun Ekonomi Kerakyatan Berbasis Gotong Royong"}
              </h4>
              <p className="mt-2 text-gray-600">
                {settings.section2Subtitle || "Koperasi Desa/Kelurahan Merah Putih dibentuk..."}
              </p>
            </div>

            {/* Kutipan dipindah ke kolom kiri */}
            <h3 className="text-lg font-medium pt-4">Kutipan Beranimasi</h3>
            <QuoteSetting 
              baseKey="section2Quote1" 
              valueText={settings.section2Quote1Text ?? null}
              valueAuthor={settings.section2Quote1Author ?? null}
              onChange={handleChange}
            />
            <QuoteSetting 
              baseKey="section2Quote2" 
              valueText={settings.section2Quote2Text ?? null}
              valueAuthor={settings.section2Quote2Author ?? null}
              onChange={handleChange}
            />
            
            <div className="mt-4 border rounded-lg p-4 bg-gray-50 h-32 flex items-center">
              <QuoteFader
                quotes={[
                  {
                    text: settings.section2Quote1Text || "“Koperasi adalah alatnya orang lemah... Tapi kalau bersatu, mereka jadi kekuatan...”",
                    author: settings.section2Quote1Author || "Presiden Prabowo Subianto",
                  },
                  {
                    text: settings.section2Quote2Text || "Teks kutipan 2...",
                    author: settings.section2Quote2Author || "Author 2",
                  },
                ]}
              />
            </div>
          </div>
      
          {/* Konten Kanan: Image Uploader BARU */}
          <div className="space-y-4">
            <ImageSettingUploader
              label="Gambar Bagian 2"
              settingKey="section2ImageUrl" // <-- Key baru untuk gambar section 2
              currentImageUrl={settings.section2ImageUrl ?? null}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      </div>
      {/* === AKHIR SECTION BARU === */}

          {/* --- BAGIAN FITUR (16 BUKU) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Bagian Fitur Unggulan (Domain Utama)
        </h2>
        
        <InputSetting 
          name="featuresMainTitle" 
          label="Judul Utama Fitur"
          as="textarea"
          value={settings.featuresMainTitle ?? null}
          onChange={handleChange}
        />
        <InputSetting 
          name="featuresMainSubtitle" 
          label="Subjudul Fitur"
          as="textarea"
          value={settings.featuresMainSubtitle ?? null}
          onChange={handleChange}
        />
        
        <p className="text-sm font-medium text-gray-700 mt-6 mb-2">
          Detail Kartu Fitur (Rekomendasi 4 item)
        </p>

        {/* Fitur 1 */}
        <div className="border p-3 rounded-md mb-3 bg-gray-50">
          <h3 className="font-semibold mb-2">Kartu Fitur 1</h3>
          <InputSetting name="featuresItem1Title" label="Judul Kartu 1" value={settings.featuresItem1Title ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem1Desc" label="Deskripsi Kartu 1" as="textarea" value={settings.featuresItem1Desc ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem1Icon" label="Ikon Kartu 1 (Nama Ikon)" value={settings.featuresItem1Icon ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem1Href" label="Link Kartu 1 (cth: /buku-anggota)" value={settings.featuresItem1Href ?? null} onChange={handleChange} />
        </div>
        
        {/* Fitur 2 */}
        <div className="border p-3 rounded-md mb-3 bg-gray-50">
          <h3 className="font-semibold mb-2">Kartu Fitur 2</h3>
          <InputSetting name="featuresItem2Title" label="Judul Kartu 2" value={settings.featuresItem2Title ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem2Desc" label="Deskripsi Kartu 2" as="textarea" value={settings.featuresItem2Desc ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem2Icon" label="Ikon Kartu 2 (Nama Ikon)" value={settings.featuresItem2Icon ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem2Href" label="Link Kartu 2 (cth: /simpanan)" value={settings.featuresItem2Href ?? null} onChange={handleChange} />
        </div>
        
        {/* Fitur 3 */}
        <div className="border p-3 rounded-md mb-3 bg-gray-50">
          <h3 className="font-semibold mb-2">Kartu Fitur 3</h3>
          <InputSetting name="featuresItem3Title" label="Judul Kartu 3" value={settings.featuresItem3Title ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem3Desc" label="Deskripsi Kartu 3" as="textarea" value={settings.featuresItem3Desc ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem3Icon" label="Ikon Kartu 3 (Nama Ikon)" value={settings.featuresItem3Icon ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem3Href" label="Link Kartu 3 (cth: /pinjaman)" value={settings.featuresItem3Href ?? null} onChange={handleChange} />
        </div>
        
        {/* Fitur 4 */}
        <div className="border p-3 rounded-md mb-3 bg-gray-50">
          <h3 className="font-semibold mb-2">Kartu Fitur 4</h3>
          <InputSetting name="featuresItem4Title" label="Judul Kartu 4" value={settings.featuresItem4Title ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem4Desc" label="Deskripsi Kartu 4" as="textarea" value={settings.featuresItem4Desc ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem4Icon" label="Ikon Kartu 4 (Nama Ikon)" value={settings.featuresItem4Icon ?? null} onChange={handleChange} />
          <InputSetting name="featuresItem4Href" label="Link Kartu 4 (cth: /notulen)" value={settings.featuresItem4Href ?? null} onChange={handleChange} />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          *Nama Ikon: Gunakan nama ikon dari Lucide React (cth: `BookUser`, `PiggyBank`, `HandCoins`, `ClipboardList`).
        </p>

      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
}