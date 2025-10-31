// app/kontak/page.tsx
"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Button from "@/components/Button";
import { FormEvent, useState, ChangeEvent } from "react"; // 1. Impor state
// 2. Impor service, types, dan toast
import toast, { Toaster } from 'react-hot-toast';
import { publicService, CreateGuestBookDto } from "@/services/auth.service"; // (Asumsi DTO ada di auth.service)
import { ApiErrorResponse } from "@/types/api.types";

export default function KontakPage() {
  
  // 3. Tambahkan state untuk loading dan form data
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGuestBookDto>({
    guestName: '',
    origin: '',
    meetWith: '',
    purpose: ''
  });

  // 4. Buat handler untuk input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 5. Modifikasi handleSubmit untuk memanggil API
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Mengirim pesan...');

    try {
      // Panggil service yang baru kita buat
      await publicService.submitGuestBookEntry(formData);
      
      toast.success('Pesan Anda berhasil terkirim. Terima kasih.', { id: toastId });
      // Reset form setelah berhasil
      setFormData({ guestName: '', origin: '', meetWith: '', purpose: '' });
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal mengirim pesan: ${message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <> {/* 6. Tambahkan Toaster */}
      <Toaster position="top-right" />
      <section className="bg-white py-14">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 text-center">
            Hubungi Kami
          </h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu Informasi + Peta (Tidak Berubah) */}
            <div className="rounded-2xl border border-red-100 bg-white shadow p-6">
              <h2 className="text-lg font-bold text-brand-red-700">Informasi Kontak</h2>
              <ul className="mt-4 space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <MapPin className="text-brand-red-600 shrink-0" />
                  <span>Jalan Koperasi Bersama No. 123, Bandung, Indonesia</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="text-brand-red-600 shrink-0" />
                  <span>(022) 1234567</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="text-brand-red-600 shrink-0" />
                  <span>info@koperasimerahputih.id</span>
                </li>
                <li className="flex gap-3">
                  <Clock className="text-brand-red-600 shrink-0" />
                  <span>Senin – Jumat, 08.00 – 16.00 WIB</span>
                </li>
              </ul>
              <h3 className="mt-6 mb-3 font-semibold text-brand-red-700">Lokasi Kami</h3>
              <div className="overflow-hidden rounded-xl border border-red-100">
                <iframe
                  title="Peta Lokasi"
                  src="https://www.google.com/maps?q=Bandung&output=embed"
                  className="w-full h-64"
                  loading="lazy"
                />
              </div>
            </div>

            {/* 7. Modifikasi Form */}
            <div className="rounded-2xl border border-red-100 bg-white shadow p-6">
              <h2 className="text-lg font-bold text-brand-red-700">Buku Tamu / Kirim Pesan</h2>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Field NAMA diubah ke guestName */}
                <div>
                  <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap Anda *
                  </label>
                  <input
                    id="guestName"
                    name="guestName" // Sesuai DTO
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={formData.guestName}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100 disabled:bg-gray-50"
                  />
                </div>

                {/* Field EMAIL dihapus, diganti ORIGIN */}
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                    Asal Instansi / Perusahaan *
                  </label>
                  <input
                    id="origin"
                    name="origin" // Sesuai DTO
                    type="text"
                    required
                    placeholder="Contoh: Tamu Publik, Anggota, PT. Maju Jaya"
                    value={formData.origin}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100 disabled:bg-gray-50"
                  />
                </div>

                {/* Field SUBJEK dihapus, diganti MEETWITH */}
                <div>
                  <label htmlFor="meetWith" className="block text-sm font-medium text-gray-700">
                    Ingin Bertemu Dengan *
                  </label>
                  <input
                    id="meetWith"
                    name="meetWith" // Sesuai DTO
                    type="text"
                    required
                    placeholder="Contoh: Pengurus, Admin, Bagian Pinjaman"
                    value={formData.meetWith}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100 disabled:bg-gray-50"
                  />
                </div>

                {/* Field PESAN diubah ke PURPOSE */}
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    Keperluan / Pesan Anda *
                  </label>
                  <textarea
                    id="purpose"
                    name="purpose" // Sesuai DTO
                    rows={5}
                    required
                    placeholder="Tuliskan keperluan Anda di sini…"
                    value={formData.purpose}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100 disabled:bg-gray-50"
                  />
                </div>

                <Button type="submit" className="rounded-full" disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Pesan'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}