'use client';

import React, { useState } from 'react';
// Nama service sudah benar (superAdminService)
import { superAdminService } from '@/services/superadmin.service'; 
import Button from '@/components/Button';
import Image from 'next/image';

interface ImageSettingUploaderProps {
  settingKey: string;
  currentImageUrl: string | null;
  label: string;
  onUploadSuccess: (key: string, newUrl: string) => void;
}

export const ImageSettingUploader: React.FC<ImageSettingUploaderProps> = ({
  settingKey,
  currentImageUrl,
  label,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Pilih file terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Panggil service dengan nama yang benar
      const response = await superAdminService.uploadPlatformSettingImage(
        settingKey,
        file,
      );

      // Jika sukses, panggil callback untuk update state di halaman utama
      onUploadSuccess(response.key, response.value);
      setPreview(response.value); // Tampilkan gambar baru dari URL R2
      setFile(null); // Reset file input
      
    // Perbaikan error ESLint (any -> unknown)
    } catch (err: unknown) {
      let message = 'Gagal mengunggah gambar.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="w-full h-48 relative bg-gray-100 rounded-md overflow-hidden">
        {preview ? (
          <Image
            src={preview}
            alt={label}
            layout="fill"
            objectFit="contain"
          />
        ) : (
          <span className="flex items-center justify-center h-full text-gray-500">
            Tidak ada gambar
          </span>
        )}
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {file && (
        // ==========================================================
        // PERBAIKAN ERROR "loading" PROP:
        // Kita ganti prop `loading` dengan `disabled`
        // dan mengubah `children` (teks tombol) berdasarkan state `loading`
        // ==========================================================
        <Button
          onClick={handleUpload}
          disabled={loading} // Button.tsx mendukung prop `disabled`
          className="w-full"
        >
          {loading ? 'Mengunggah...' : 'Upload & Simpan Gambar Ini'}
        </Button>
        // ==========================================================
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};