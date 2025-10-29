// Lokasi: frontend/app/dashboard/anggota/saran/page.tsx
"use client";

import Button from "@/components/Button";
import { useEffect, useState } from "react";
import clsx from "clsx";

// Data contoh untuk riwayat saran
const mockSaran = [
  {
    tanggal: "10 September 2025",
    subjek: "Perbaikan Jam Operasional",
    status: "Terkirim",
  },
  {
    tanggal: "15 Agustus 2025",
    subjek: "Usulan Produk Baru",
    status: "Sudah Ditanggapi",
  },
];

export default function HalamanSaranAnggota() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const SaranSkeleton = () => (
    <div>
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-5 w-1/2 mt-2" />

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-28 w-full" />
          </div>
          <div className="text-right">
            <Skeleton className="h-10 w-36 ml-auto" />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <Skeleton className="h-6 w-56 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  const handleSubmitSaran = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Saran Anda telah berhasil dikirim (simulasi).");
    event.currentTarget.reset();
  };

  if (loading) {
    return <SaranSkeleton />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Saran untuk Koperasi</h1>
      <p className="mt-2 text-gray-600">Sampaikan ide dan masukan Anda untuk kemajuan koperasi kita bersama.</p>

      {/* Form untuk mengirim saran baru */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Kirim Saran Baru</h2>
        <form onSubmit={handleSubmitSaran} className="space-y-4">
          <div>
            <label htmlFor="subjek" className="block text-sm font-medium text-gray-700">
              Subjek
            </label>
            <input
              type="text"
              id="subjek"
              name="subjek"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Contoh: Usulan jam pelayanan baru"
            />
          </div>
          <div>
            <label htmlFor="pesan" className="block text-sm font-medium text-gray-700">
              Isi Saran
            </label>
            <textarea
              id="pesan"
              name="pesan"
              rows={5}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Tuliskan saran atau masukan Anda secara detail di sini..."
            />
          </div>
          <div className="text-right">
            <Button type="submit">Kirim Saran</Button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Saran */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Saran Anda</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Subjek</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockSaran.map((saran, index) => (
                <tr key={index} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                  <td className="p-4">{saran.tanggal}</td>
                  <td className="p-4 font-medium text-gray-800">{saran.subjek}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      saran.status === 'Terkirim' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {saran.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
