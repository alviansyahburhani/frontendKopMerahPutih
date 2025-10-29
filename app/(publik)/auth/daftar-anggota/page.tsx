"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "@/components/Button";
import { publicService } from "@/services/auth.service"; // <-- Gunakan service
import toast, { Toaster } from 'react-hot-toast';
import {
  ApiErrorResponse,
  CreateMemberRegistrationDto
} from "@/types/api.types"; // <-- Impor tipe DTO dari sini
import { Gender } from "@/types/enums";

export default function DaftarAnggotaPage() {
  const [formData, setFormData] = useState<CreateMemberRegistrationDto & { 
    ulangiKataSandi: string; 
    terms: boolean 
  }>({
    nik: "",
    fullName: "",
    gender: Gender.MALE, // Default
    email: "",
    phoneNumber: "",
    password: "",
    ulangiKataSandi: "",
    placeOfBirth: "",
    dateOfBirth: "", // YYYY-MM-DD
    occupation: "",
    address: "",
    targetSubdomain: undefined, // Kosongkan jika daftar via subdomain
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.ulangiKataSandi) {
      const msg = "Kata sandi dan konfirmasi kata sandi tidak cocok!";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.terms) {
      const msg = "Anda harus menyetujui pernyataan.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Mengirim permohonan pendaftaran...');
    
    
    try {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ulangiKataSandi,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        terms,
        ...payload
      } = formData;

      // Cek subdomain saat ini (jika pendaftaran via subdomain)
      // Jika tidak, Anda perlu input 'targetSubdomain' dari form
      // if (typeof window !== 'undefined' && !payload.targetSubdomain) {
      //   const subdomain = window.location.hostname.split('.')[0];
      //   if (subdomain !== 'www' && subdomain !== 'localhost') {
      //     payload.targetSubdomain = subdomain;
      //   }
      // }

      const result = await publicService.registerMember(payload);

      toast.success(result.message, { id: toastId, duration: 5000 });
      // TODO: Redirect ke halaman sukses
      // router.push('/auth/registrasi-anggota-sukses');
      
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      console.error('Member registration failed:', apiError);
      const errorMessage = Array.isArray(apiError.message)
        ? apiError.message.join(', ')
        : apiError.message;
      setError(errorMessage);
      toast.error(`Pendaftaran Gagal: ${errorMessage}`, { id: toastId, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
     <>
      <Toaster position="top-right" />
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
             <h1 className="text-2xl font-bold text-center text-brand-red-700">
                Pendaftaran Anggota Koperasi
            </h1>
            <p className="mt-2 text-center text-gray-600">
                Lengkapi data di bawah ini untuk menjadi bagian dari kami.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              {/* --- Informasi Pribadi --- */}
              <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-semibold px-2 text-gray-800">Informasi Pribadi</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  <div>
                    <label htmlFor="nik" className="block text-sm font-medium text-gray-700">Nomor Induk Kependudukan*</label>
                    <input type="text" name="nik" id="nik" required pattern="\d{16}" title="NIK harus 16 digit angka" value={formData.nik} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label>
                    <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div>
                    <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label>
                    <input type="text" name="placeOfBirth" id="placeOfBirth" required value={formData.placeOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label>
                    <input type="date" name="dateOfBirth" id="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label>
                    <select name="gender" id="gender" required value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white" disabled={loading}>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Pekerjaan*</label>
                    <input type="text" name="occupation" id="occupation" required value={formData.occupation} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email*</label>
                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Nomor HP*</label>
                    <input type="tel" name="phoneNumber" id="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap (Sesuai KTP)*</label>
                      <textarea name="address" id="address" rows={3} required value={formData.address} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                  </div>
                  
                  {/* --- Info Akun --- */}
                  <div className="relative md:col-span-2 border-t pt-4 mt-4">
                     <h3 className="text-md font-semibold text-gray-700">Informasi Akun</h3>
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Buat Kata Sandi*</label>
                    <input type={showPassword ? "text" : "password"} name="password" id="password" required minLength={8} value={formData.password} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                    <button type="button" className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter.</p>
                  </div>
                  <div className="relative">
                    <label htmlFor="ulangiKataSandi" className="block text-sm font-medium text-gray-700">Ulangi Kata Sandi*</label>
                    <input type={showUlangiPassword ? "text" : "password"} name="ulangiKataSandi" id="ulangiKataSandi" required value={formData.ulangiKataSandi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={loading}/>
                    <button type="button" className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500" onClick={() => setShowUlangiPassword(!showUlangiPassword)} disabled={loading}>
                      {showUlangiPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </fieldset>

              {/* Tampilkan Pesan Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {/* Checkbox Pernyataan */}
              <div className="flex items-start">
                  <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange} className="h-4 w-4 text-brand-red-600 border-gray-300 rounded mt-1" disabled={loading}/>
                  <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                      Dengan ini saya menyatakan bersedia menjadi anggota Koperasi...
                  </label>
              </div>

              {/* Tombol Submit */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading || !formData.terms}>
                  {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </Button>
              </div>
               <p className="mt-6 text-sm text-center text-gray-600">
                    Sudah punya akun anggota?{' '}
                    <Link href="/auth/login" className="font-medium text-brand-red-600 hover:text-red-500">
                        Masuk di sini
                    </Link>
                </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}