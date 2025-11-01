// app/(publik)/kontak/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast"; // Gunakan react-hot-toast
import { publicService } from "@/services/public.service"; 
import { CreateGuestBookDto, ApiErrorResponse } from "@/types/api.types"; 
import { Loader2 } from "lucide-react";
import Button from "@/components/Button"; 

// ===================================
// Komponen Form Buku Tamu
// ===================================
const GuestBookForm = () => {
  const [formData, setFormData] = useState<CreateGuestBookDto>({
    guestName: "",
    origin: "",
    meetWith: "",
    purpose: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.guestName || !formData.origin || !formData.purpose) {
      toast.error("Nama, Asal/Instansi, dan Maksud & Tujuan wajib diisi.");
      return;
    }
    
    setIsLoading(true);
    const promise = publicService.createGuestBookEntry(formData);
    
    toast.promise(promise, {
      loading: 'Mengirim catatan kunjungan...',
      success: () => {
        setIsLoading(false);
        setFormData({ guestName: "", origin: "", meetWith: "", purpose: "" });
        return 'Buku tamu berhasil diisi. Terima kasih!';
      },
      error: (err) => {
        setIsLoading(false);
        const apiError = err as ApiErrorResponse;
        return `Gagal: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Buku Tamu</h2>
      <p className="text-sm text-gray-600 mb-4">
        Silakan isi buku tamu untuk mencatat kunjungan Anda ke koperasi kami.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
            Nama Anda *
          </label>
          <input
            type="text"
            name="guestName"
            id="guestName"
            value={formData.guestName}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500"
          />
        </div>
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
            Asal/Instansi *
          </label>
          <input
            type="text"
            name="origin"
            id="origin"
            value={formData.origin}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500"
          />
        </div>
        <div>
          <label htmlFor="meetWith" className="block text-sm font-medium text-gray-700">
            Bertemu Dengan
          </label>
          <input
            type="text"
            name="meetWith"
            id="meetWith"
            placeholder="Contoh: Bpk. Ketua"
            value={formData.meetWith || ''}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500"
          />
        </div>
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Maksud & Tujuan *
          </label>
          <textarea
            name="purpose"
            id="purpose"
            rows={3}
            value={formData.purpose}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500"
          />
        </div>
        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Kirim Catatan Kunjungan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// ===================================
// Komponen Form Kontak (UI Saja)
// ===================================
const ContactForm = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info("Fitur kirim pesan kontak sedang dalam pengembangan.");
  };

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Hubungi Kami</h2>
      <p className="text-sm text-gray-600 mb-4">
        Ada pertanyaan atau masukan lain? Sampaikan melalui form di bawah ini.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nama Anda
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Anda
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Pesan Anda
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <Button
            type="submit"
            variant="outline"
            className="w-full flex justify-center"
          >
            Kirim Pesan
          </Button>
        </div>
      </form>
    </div>
  );
};

// ===================================
// Halaman Utama
// ===================================
export default function KontakPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-right" /> 
      
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Kontak & Buku Tamu
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Silakan tinggalkan pesan atau isi buku tamu kunjungan Anda.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <GuestBookForm />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}