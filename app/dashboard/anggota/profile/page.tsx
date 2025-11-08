// Lokasi: frontend/app/dashboard/anggota/profile/page.tsx
"use client";

import Button from '@/components/Button';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// Data contoh untuk profil anggota
const dataProfil = {
  nomorAnggota: "AGT-001",
  namaLengkap: "Alviansyah Burhani",
  ttl: "Makassar, 15 Mei 1990",
  jenisKelamin: "Laki-laki",
  pekerjaan: "Wiraswasta",
  alamat: "Jl. Merdeka No. 10, Makassar, Sulawesi Selatan",
  tanggalMasuk: "15 Januari 2024",
  status: "Aktif",
  email: "alviansyah.b@email.com",
  noTelepon: "0812-3456-7890",
};

export default function HalamanProfil() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const ProfileSkeleton = () => (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1 bg-gray-50 p-8 flex flex-col items-center justify-center border-r">
            <Skeleton className="w-32 h-32 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-24 mt-4 rounded-full" />
          </div>
          <div className="md:col-span-2 p-8">
            <Skeleton className="h-6 w-64 mb-6" />
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="w-5 h-5 rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-28 mb-1" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
          <p className="mt-2 text-gray-600">Informasi keanggotaan Anda di Koperasi Merah Putih.</p>
        </div>
        <Button variant="outline">Ajukan Perubahan Data</Button>
      </div>

      {/* --- KARTU PROFIL BARU --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          {/* KOLOM KIRI: Foto & Info Utama */}
          <div className="md:col-span-1 bg-gray-50 p-8 flex flex-col items-center justify-center border-r">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <User className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{dataProfil.namaLengkap}</h2>
            <p className="text-gray-500">{dataProfil.nomorAnggota}</p>
            <span className="mt-4 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
              {dataProfil.status}
            </span>
          </div>

          {/* KOLOM KANAN: Detail Informasi */}
          <div className="md:col-span-2 p-8">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Detail Informasi Anggota</h3>
            <div className="space-y-6">
              {/* Info Pribadi */}
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Pekerjaan</p>
                  <p className="font-semibold text-gray-800">{dataProfil.pekerjaan}</p>
                </div>
              </div>
               <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Tempat, Tanggal Lahir</p>
                  <p className="font-semibold text-gray-800">{dataProfil.ttl}</p>
                </div>
              </div>
              {/* Info Kontak */}
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{dataProfil.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">No. Telepon</p>
                  <p className="font-semibold text-gray-800">{dataProfil.noTelepon}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-semibold text-gray-800">{dataProfil.alamat}</p>
                </div>
              </div>
               {/* Info Keanggotaan */}
               <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                  <p className="font-semibold text-gray-800">{dataProfil.tanggalMasuk}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
