"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from 'next/link';
import { FiEye, FiEyeOff, FiUpload } from 'react-icons/fi';
import Button from "@/components/Button";
import { publicService } from "@/services/auth.service";
import toast, { Toaster } from 'react-hot-toast';
import { ApiErrorResponse, RegisterTenantDto } from "@/types/api.types";
import { Gender } from "@/types/enums";

// Definisikan tipe untuk state file
type FileState = {
  dokPengesahan: File | null;
  dokDaftarUmum: File | null;
  dokAkte: File | null;
  dokNpwp: File | null;
};

// Nama field file
type FileKey = keyof FileState;

export default function DaftarKoperasiPage() {
  // State untuk data form (non-file)
  const [formData, setFormData] = useState<Omit<RegisterTenantDto, 
    'dokPengesahanPendirianUrl' | 
    'dokDaftarUmumUrl' | 
    'dokAkteNotarisUrl' | 
    'dokNpwpKoperasiUrl'
  >>({
    cooperativeName: '',
    subdomain: '',
    skAhuKoperasi: '',
    province: '',
    city: '',
    district: '',
    village: '',
    alamatLengkap: '',
    petaLokasi: '',
    picFullName: '',
    picNik: '',
    picGender: Gender.MALE,
    picPlaceOfBirth: '',
    picDateOfBirth: '',
    picOccupation: '',
    picAddress: '',
    picPhoneNumber: '',
    email: '',
    password: '',
  });
  
  // State terpisah untuk password konfirmasi
  const [ulangiKataSandi, setUlangiKataSandi] = useState('');

  // State terpisah untuk file
  const [files, setFiles] = useState<FileState>({
    dokPengesahan: null,
    dokDaftarUmum: null,
    dokAkte: null,
    dokNpwp: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'cooperativeName') {
      // Otomatis generate subdomain sederhana
      const subdomain = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prevState => ({ 
        ...prevState, 
        cooperativeName: value,
        subdomain: subdomain
      }));
    } else {
      setFormData(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    const fileKey = name as FileKey;
    
    if (inputFiles && inputFiles.length > 0) {
      const file = inputFiles[0];
      if (file.size > 5 * 1024 * 1024) { // Validasi 5MB
          toast.error(`Ukuran file ${file.name} melebihi batas 5MB.`);
          e.target.value = ''; 
          setFiles(prevState => ({ ...prevState, [fileKey]: null }));
          return;
      }
      setFiles(prevState => ({ ...prevState, [fileKey]: file }));
    } else {
      setFiles(prevState => ({ ...prevState, [fileKey]: null }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== ulangiKataSandi) {
      const msg = "Kata sandi dan konfirmasi kata sandi tidak cocok!";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validasi file wajib
    const requiredFiles: FileKey[] = ['dokPengesahan', 'dokDaftarUmum', 'dokAkte', 'dokNpwp'];
    for (const key of requiredFiles) {
      if (!files[key]) {
        const msg = `Dokumen ${key} wajib diunggah.`;
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setLoading(true);
    const toastId = toast.loading('Mengirim permohonan pendaftaran...');

    try {
      // 1. Upload semua file secara paralel
      toast.loading('Mengunggah dokumen...', { id: toastId });
      
      const uploadPromises = [
        publicService.uploadFile(files.dokPengesahan!, '/uploads/tenant-registration/pengesahan-pendirian'),
        publicService.uploadFile(files.dokDaftarUmum!, '/uploads/tenant-registration/daftar-umum'),
        publicService.uploadFile(files.dokAkte!, '/uploads/tenant-registration/akte-notaris'),
        publicService.uploadFile(files.dokNpwp!, '/uploads/tenant-registration/npwp-koperasi'),
      ];

      const [
        uploadPengesahan, 
        uploadDaftarUmum, 
        uploadAkte, 
        uploadNpwp
      ] = await Promise.all(uploadPromises);

      // 2. Siapkan DTO lengkap dengan URL
      const finalPayload: RegisterTenantDto = {
        ...formData,
        dokPengesahanPendirianUrl: uploadPengesahan.url,
        dokDaftarUmumUrl: uploadDaftarUmum.url,
        dokAkteNotarisUrl: uploadAkte.url,
        dokNpwpKoperasiUrl: uploadNpwp.url,
      };
      
      // 3. Kirim data lengkap ke endpoint registrasi tenant
      toast.loading('Memfinalisasi registrasi...', { id: toastId });
      const result = await publicService.registerTenant(finalPayload);

      toast.success(result.message, { id: toastId, duration: 5000 });
      // TODO: Redirect ke halaman sukses
      // router.push('/auth/registrasi-koperasi-sukses');
      
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      console.error('Registration failed:', apiError);
      const errorMessage = Array.isArray(apiError.message)
        ? apiError.message.join(', ')
        : apiError.message;
      setError(errorMessage);
      toast.error(`Pendaftaran Gagal: ${errorMessage}`, { id: toastId, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const renderFileName = (file: File | null) => {
     if (file) {
      return <span className="text-sm text-gray-600 ml-2 truncate max-w-[200px]">{file.name}</span>;
    }
    return <span className="text-sm text-gray-500 ml-2">Belum ada file</span>;
  };

  return (
    <>
      <Toaster position="top-right" />
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-brand-red-700">Form Permohonan Akun Koperasi</h1>
                <p className="mt-2 text-gray-600">Daftarkan Koperasi Desa/Kelurahan Anda ke dalam sistem.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* === Fieldset Kedudukan Koperasi === */}
              <fieldset className="space-y-4 border p-4 rounded-lg">
                <legend className="text-lg font-semibold text-gray-800 px-2">Kedudukan Koperasi</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cooperativeName" className="block text-sm font-medium text-gray-700">Nama Koperasi <span className="text-red-500">*</span></label>
                        <input id="cooperativeName" name="cooperativeName" type="text" required value={formData.cooperativeName} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                    </div>
                     <div>
                        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Subdomain <span className="text-red-500">*</span></label>
                        <input id="subdomain" name="subdomain" type="text" required value={formData.subdomain} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                         <p className="text-xs text-gray-500 mt-1">{formData.subdomain}.koperasimerahputih.com</p>
                    </div>
                     <div>
                        <label htmlFor="skAhuKoperasi" className="block text-sm font-medium text-gray-700">SK AHU Koperasi <span className="text-red-500">*</span></label>
                        <input id="skAhuKoperasi" name="skAhuKoperasi" type="text" required value={formData.skAhuKoperasi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provinsi <span className="text-red-500">*</span></label>
                        <input id="province" name="province" type="text" required value={formData.province} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kabupaten/Kota <span className="text-red-500">*</span></label>
                        <input id="city" name="city" type="text" required value={formData.city} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                    </div>
                    <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">Kecamatan <span className="text-red-500">*</span></label>
                        <input id="district" name="district" type="text" required value={formData.district} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                    </div>
                    <div>
                        <label htmlFor="village" className="block text-sm font-medium text-gray-700">Desa/Kelurahan <span className="text-red-500">*</span></label>
                        <input id="village" name="village" type="text" required value={formData.village} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="alamatLengkap" className="block text-sm font-medium text-gray-700">Alamat Lengkap <span className="text-red-500">*</span></label>
                    <textarea id="alamatLengkap" name="alamatLengkap" rows={3} required value={formData.alamatLengkap} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                </div>
                 <div>
                    <label htmlFor="petaLokasi" className="block text-sm font-medium text-gray-700">Link Google Maps (Opsional)</label>
                    <input id="petaLokasi" name="petaLokasi" type="url" value={formData.petaLokasi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="https://maps.app.goo.gl/..." disabled={loading} />
                </div>
              </fieldset>

              {/* === Fieldset Informasi PIC === */}
              <fieldset className="space-y-4 border p-4 rounded-lg">
                <legend className="text-lg font-semibold text-gray-800 px-2">Informasi PIC (Penanggung Jawab)</legend>
                 <p className="text-sm text-gray-500">Data PIC yang akan menjadi admin pertama koperasi ini.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="picFullName" className="block text-sm font-medium text-gray-700">Nama Lengkap PIC <span className="text-red-500">*</span></label>
                    <input id="picFullName" name="picFullName" type="text" required value={formData.picFullName} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="picNik" className="block text-sm font-medium text-gray-700">NIK PIC <span className="text-red-500">*</span></label>
                    <input id="picNik" name="picNik" type="text" required pattern="\d{16}" title="NIK harus 16 digit angka" value={formData.picNik} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="picGender" className="block text-sm font-medium text-gray-700">Jenis Kelamin PIC <span className="text-red-500">*</span></label>
                    <select id="picGender" name="picGender" required value={formData.picGender} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white" disabled={loading}>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="picPlaceOfBirth" className="block text-sm font-medium text-gray-700">Tempat Lahir PIC <span className="text-red-500">*</span></label>
                    <input id="picPlaceOfBirth" name="picPlaceOfBirth" type="text" required value={formData.picPlaceOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                  <div>
                    <label htmlFor="picDateOfBirth" className="block text-sm font-medium text-gray-700">Tanggal Lahir PIC <span className="text-red-500">*</span></label>
                    <input id="picDateOfBirth" name="picDateOfBirth" type="date" required value={formData.picDateOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                   <div>
                    <label htmlFor="picOccupation" className="block text-sm font-medium text-gray-700">Pekerjaan PIC <span className="text-red-500">*</span></label>
                    <input id="picOccupation" name="picOccupation" type="text" required value={formData.picOccupation} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                   <div>
                    <label htmlFor="picPhoneNumber" className="block text-sm font-medium text-gray-700">No. Telepon PIC <span className="text-red-500">*</span></label>
                    <input id="picPhoneNumber" name="picPhoneNumber" type="tel" required value={formData.picPhoneNumber} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                </div>
                 <div>
                    <label htmlFor="picAddress" className="block text-sm font-medium text-gray-700">Alamat Lengkap PIC <span className="text-red-500">*</span></label>
                    <textarea id="picAddress" name="picAddress" rows={3} required value={formData.picAddress} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                </div>
              </fieldset>

              {/* === Fieldset Informasi Akun === */}
              <fieldset className="space-y-4 border p-4 rounded-lg">
                <legend className="text-lg font-semibold text-gray-800 px-2">Informasi Akun Koperasi</legend>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Koperasi (untuk Login) <span className="text-red-500">*</span></label>
                    <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Kata Sandi <span className="text-red-500">*</span></label>
                        <div className="relative mt-1">
                            <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={8} value={formData.password} onChange={handleChange} className="w-full p-2 pr-10 border border-gray-300 rounded-md" disabled={loading} />
                            <button type="button" className="absolute inset-y-0 right-0 px-3" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                         <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter.</p>
                    </div>
                    <div>
                        <label htmlFor="ulangiKataSandi" className="block text-sm font-medium text-gray-700">Ulangi Kata Sandi <span className="text-red-500">*</span></label>
                        <div className="relative mt-1">
                            <input id="ulangiKataSandi" name="ulangiKataSandi" type={showUlangiPassword ? "text" : "password"} required value={ulangiKataSandi} onChange={(e) => setUlangiKataSandi(e.target.value)} className="w-full p-2 pr-10 border border-gray-300 rounded-md" disabled={loading} />
                            <button type="button" className="absolute inset-y-0 right-0 px-3" onClick={() => setShowUlangiPassword(!showUlangiPassword)} disabled={loading}>
                                {showUlangiPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                 </div>
              </fieldset>

              {/* === Fieldset Dokumen Pendukung === */}
              <fieldset className="space-y-4 border p-4 rounded-lg">
                <legend className="text-lg font-semibold text-gray-800 px-2">Dokumen Pendukung</legend>
                 <p className="text-sm text-gray-500">Unggah dokumen dalam format PDF, JPG, atau PNG (maks. 5MB).</p>
                 
                {(['dokPengesahan', 'dokDaftarUmum', 'dokAkte', 'dokNpwp'] as FileKey[]).map((key) => {
                  // Label yang lebih ramah
                  const labels: Record<FileKey, string> = {
                    dokPengesahan: 'Pengesahan Pendirian',
                    dokDaftarUmum: 'Daftar Umum',
                    dokAkte: 'Akte Notaris',
                    dokNpwp: 'NPWP Koperasi',
                  };
                  
                  return (
                    <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">{labels[key]} <span className="text-red-500">*</span></label>
                        <div className="flex items-center">
                        <label htmlFor={key} className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium bg-white ${loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                            <FiUpload className="h-4 w-4" /> Pilih File
                        </label>
                        <input id={key} name={key} type="file" required className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" disabled={loading}/>
                        {renderFileName(files[key])}
                        </div>
                    </div>
                  );
                })}
              </fieldset>

              {/* Tampilkan Pesan Error */}
                {error && (
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">
                    {error}
                </div>
                )}

              {/* Tombol Submit */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Mengirim...' : 'Kirim Permohonan'}
                </Button>
              </div>
            </form>

             <p className="mt-6 text-sm text-center text-gray-600">
                Sudah mendaftarkan koperasi Anda?{' '}
                <Link href="/auth/login" className="font-medium text-brand-red-600 hover:text-red-500">
                Masuk di sini
                </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}