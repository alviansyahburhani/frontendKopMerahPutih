// app/kontak/page.tsx
"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Button from "@/components/Button";
import { FormEvent } from "react";

export default function KontakPage() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Pesan terkirim (dummy). Sambungkan ke API backend nanti ya.");
  };

  return (
    <section className="bg-white py-14">
      <div className="container mx-auto px-4">
        {/* Judul */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 text-center">
          Hubungi Kami
        </h1>

        {/* Grid 2 kolom */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kartu Informasi + Peta */}
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
              {/* Ganti src di bawah dengan embed map alamatmu */}
              <iframe
                title="Peta Lokasi"
                src="https://www.google.com/maps?q=Bandung&output=embed"
                className="w-full h-64"
                loading="lazy"
              />
            </div>
          </div>

          {/* Kartu Form */}
          <div className="rounded-2xl border border-red-100 bg-white shadow p-6">
            <h2 className="text-lg font-bold text-brand-red-700">Kirim Pesan kepada Kami</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  required
                  placeholder="Nama Anda"
                  className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="email@contoh.com"
                  className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>

              <div>
                <label htmlFor="subjek" className="block text-sm font-medium text-gray-700">
                  Subjek
                </label>
                <input
                  id="subjek"
                  name="subjek"
                  type="text"
                  required
                  placeholder="Subjek Pesan"
                  className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>

              <div>
                <label htmlFor="pesan" className="block text-sm font-medium text-gray-700">
                  Pesan Anda
                </label>
                <textarea
                  id="pesan"
                  name="pesan"
                  rows={5}
                  required
                  placeholder="Tulis pesan Anda di sini…"
                  className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>

              <Button className="rounded-full">Kirim Pesan</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
