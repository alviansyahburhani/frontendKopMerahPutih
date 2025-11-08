// Lokasi: frontend/app/dashboard/anggota/profile/page.tsx
"use client";

import Button from '@/components/Button';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, ShieldCheck, Edit3 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';
import SignaturePad from 'react-signature-canvas';
// Hapus 'Image' dari next/image, kita pakai <img> standar
// import Image from 'next/image'; 

// Impor service dan tipe data
import { memberService } from '@/services/member.service';
import { MemberProfile, ApiErrorResponse, UpdateMyProfileDto } from '@/types/api.types';

/**
 * Komponen Tanda Tangan
 * (Tidak ada perubahan di sini, ini sudah benar)
 */
const SignaturePadComponent = ({ onSave }: { onSave: (signatureDataUrl: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const sigPadRef = useRef<SignaturePad>(null);

  const handleSaveSignature = async () => {
    if (sigPadRef.current?.isEmpty()) {
      toast.error('Tanda tangan tidak boleh kosong.');
      return;
    }
    setLoading(true);
    const dataUrl = sigPadRef.current!.getCanvas().toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  return (
    <div className="mt-6 p-4 border border-dashed border-brand-red-300 rounded-lg bg-red-50">
      <h4 className="font-semibold text-gray-700">Lengkapi Tanda Tangan Anda</h4>
      <p className="text-sm text-gray-500 mb-4">
        Tanda tangan Anda belum ada. Silakan gambar di bawah ini.
      </p>
      
      <div className="bg-white border border-gray-300 rounded-md w-full max-w-md h-40">
        <SignaturePad
          ref={sigPadRef}
          canvasProps={{
            className: 'w-full h-full'
          }}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={handleClear} 
          disabled={loading}
        >
          Hapus
        </Button>
        <Button 
          onClick={handleSaveSignature} 
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Simpan Tanda Tangan'}
        </Button>
      </div>
    </div>
  );
};


/**
 * Halaman Profil Utama
 */
export default function HalamanProfil() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Komponen Skeleton utilitas (sudah ada)
  const Skeleton = ({ className = "" }: { className?: string }) => ( <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} /> );
  
  // --- [MODIFIKASI] ---
  // Komponen ProfileSkeleton sekarang diisi dengan tata letak
  const ProfileSkeleton = () => ( 
    <div>
      {/* Skeleton untuk Header Halaman */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      {/* Skeleton untuk Kartu Profil */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          {/* Skeleton Kolom Kiri (Avatar, Nama) */}
          <div className="md:col-span-1 bg-gray-50 p-8 flex flex-col items-center justify-center border-r">
            <Skeleton className="w-32 h-32 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-24 mt-4 rounded-full" />
          </div>

          {/* Skeleton Kolom Kanan (Detail Info) */}
          <div className="md:col-span-2 p-8">
            <Skeleton className="h-6 w-64 mb-6" />
            <div className="space-y-6">
              {/* Buat 6 baris info palsu */}
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
  
  // Fetch data profil (sudah benar)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await memberService.getMyProfile(); 
        setProfile(data);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        console.error("Gagal fetch profil:", apiError);
        const msg = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
        setError(msg || "Gagal memuat data profil.");
        toast.error(msg || "Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fungsi simpan TTD (sudah benar)
  const handleSaveSignature = async (signatureDataUrl: string) => {
    const toastId = toast.loading('Menyimpan tanda tangan...');
    
    const base64Data = signatureDataUrl.split(',')[1];

    if (!base64Data) {
        toast.error('Gagal memproses data tanda tangan.', { id: toastId });
        return;
    }

    const dto: UpdateMyProfileDto = {
      signatureData: base64Data 
    };

    try {
      const updatedProfile = await memberService.updateMyProfile(dto);
      setProfile(updatedProfile); 
      toast.success('Tanda tangan berhasil disimpan!', { id: toastId });
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      console.error('Gagal simpan TTD:', apiError); 
      const msg = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(msg || 'Gagal menyimpan tanda tangan.', { id: toastId });
    }
  };

  // Tampilkan Skeleton jika 'loading' adalah true
  if (loading) {
    return <ProfileSkeleton />;
  }
  
  if (error) { return ( <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg border border-red-200"> <h3 className="font-bold">Terjadi Kesalahan</h3> <p>{error}</p> </div> ); }
  if (!profile) { return <div className="text-center text-gray-500">Data profil tidak ditemukan.</div>; }

  // Helper format data (sudah benar)
  const ttl = `${profile.placeOfBirth || '...'}, ${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '...'}`;
  const statusAnggota = profile.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif';
  const tglGabung = profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '...';

  // Render Halaman (sudah benar)
  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
          <p className="mt-2 text-gray-600">Informasi keanggotaan Anda di Koperasi Merah Putih.</p>
        </div>
        <Button variant="outline">Ajukan Perubahan Data</Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          <div className="md:col-span-1 bg-gray-50 p-8 flex flex-col items-center justify-center border-r">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <User className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.fullName}</h2>
            <p className="text-gray-500">{profile.memberNumber}</p>
            <span className={clsx("mt-4 px-3 py-1 text-sm font-semibold rounded-full", profile.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
              {statusAnggota}
            </span>
          </div>

          <div className="md:col-span-2 p-8">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Detail Informasi Anggota</h3>
            <div className="space-y-6">
              
              <div className="flex items-center"> <Briefcase className="w-5 h-5 text-gray-400 mr-4" /> <div> <p className="text-sm text-gray-500">Pekerjaan</p> <p className="font-semibold text-gray-800">{profile.occupation}</p> </div> </div>
              <div className="flex items-center"> <Calendar className="w-5 h-5 text-gray-400 mr-4" /> <div> <p className="text-sm text-gray-500">Tempat, Tanggal Lahir</p> <p className="font-semibold text-gray-800">{ttl}</p> </div> </div>
              <div className="flex items-center"> <Mail className="w-5 h-5 text-gray-400 mr-4" /> <div> <p className="text-sm text-gray-500">Email</p> <p className="font-semibold text-gray-800">{profile.email}</p> </div> </div>
              <div className="flex items-center"> <Phone className="w-5 h-5 text-gray-400 mr-4" /> <div> <p className="text-sm text-gray-500">No. Telepon</p> <p className="font-semibold text-gray-800">{profile.phoneNumber}</p> </div> </div>
              <div className="flex items-center"> <MapPin className="w-5 h-5 text-gray-400 mr-4" /> <div> <p className="text-sm text-gray-500">Alamat</p> <p className="font-semibold text-gray-800">{profile.address}</p> </div> </div>
              <div className="flex items-center"> <ShieldCheck className="w-5 h-5 text-gray-400 mr-4" /> <div> <p className="text-sm text-gray-500">Tanggal Bergabung</p> <p className="font-semibold text-gray-800">{tglGabung}</p> </div> </div>

              {/* Logika Tanda Tangan (sudah benar) */}
              <div className="flex items-start">
                <Edit3 className="w-5 h-5 text-gray-400 mr-4 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Tanda Tangan Digital</p>
                  
                  {profile.signatureUrl || profile.signatureData ? (
                    <div className="mt-2 p-2 border border-gray-200 rounded-md inline-block bg-white">
                      <img 
                        src={profile.signatureUrl || `data:image/png;base64,${profile.signatureData}`} 
                        alt="Tanda Tangan" 
                        className="h-24 w-auto" 
                      />
                    </div>
                  ) : (
                    <SignaturePadComponent onSave={handleSaveSignature} />
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}