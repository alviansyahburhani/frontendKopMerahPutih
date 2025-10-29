// Lokasi: frontend/app/dashboard/admin/sistem/pengaturan/page.tsx
"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Lock, Shield, Save, QrCode } from "lucide-react";
import clsx from "clsx";

export default function PengaturanAkunPage() {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);

  // State untuk 2FA, asumsi awalnya belum aktif
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Kata sandi baru dan konfirmasi tidak cocok!");
      return;
    }
    alert("Simulasi: Kata sandi berhasil diubah!");
    console.log("Data kata sandi baru:", passwordData.newPassword);
    // Logika API untuk mengubah kata sandi
  };

  const handle2FAToggle = () => {
    // Logika ini akan lebih kompleks saat dihubungkan ke backend
    setIs2FAEnabled(!is2FAEnabled);
    if (!is2FAEnabled) {
      alert("Simulasi: Mengaktifkan 2FA. Pindai QR Code di bawah dengan aplikasi authenticator Anda.");
    } else {
      alert("Simulasi: Otentikasi Dua Faktor telah dinonaktifkan.");
    }
  };

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const PengaturanSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kartu Ubah Kata Sandi */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b">
            <Skeleton className="h-6 w-40 mb-4" />
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Kartu Otentikasi Dua Faktor */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b">
            <Skeleton className="h-6 w-48 mb-4" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-10 w-40 mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <PengaturanSkeleton />;
  }


  return (
    <div>
      <AdminPageHeader
        title="Pengaturan Akun & Keamanan"
        description="Kelola kata sandi dan keamanan akun Anda."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* --- KARTU UBAH KATA SANDI --- */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={handlePasswordSubmit}>
            <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2"><Lock size={20}/> Ubah Kata Sandi</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-600 mb-1">Kata Sandi Lama</label>
                  <input id="oldPassword" name="oldPassword" type="password" required value={passwordData.oldPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">Kata Sandi Baru</label>
                  <input id="newPassword" name="newPassword" type="password" required value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" required value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <Button type="submit"><Save size={18}/> Simpan Kata Sandi</Button>
            </div>
          </form>
        </div>

        {/* --- KARTU OTENTIKASI DUA FAKTOR (2FA) --- */}
         <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2"><Shield size={20}/> Otentikasi Dua Faktor (2FA)</h2>
            </div>
            <div className="p-6">
                {is2FAEnabled ? (
                    <div>
                        <p className="text-sm text-green-700 bg-green-100 p-3 rounded-lg mb-4">
                            <b>Status: Aktif.</b> Akun Anda dilindungi dengan lapisan keamanan tambahan.
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            Untuk menonaktifkan 2FA, Anda akan diminta memasukkan kode dari aplikasi authenticator Anda.
                        </p>
                        <Button onClick={handle2FAToggle} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                            Nonaktifkan 2FA
                        </Button>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-lg mb-4">
                            <b>Status: Tidak Aktif.</b> Tingkatkan keamanan akun Anda dengan mengaktifkan 2FA.
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            Setelah diaktifkan, Anda akan diminta memindai QR code dengan aplikasi seperti Google Authenticator, lalu memasukkan kode verifikasi.
                        </p>
                         <Button onClick={handle2FAToggle} variant="primary" className="w-full">
                            Aktifkan 2FA
                        </Button>
                    </div>
                )}

                {/* Bagian ini akan tampil saat proses aktivasi */}
                {is2FAEnabled && (
                     <div className="mt-6 text-center border-t pt-6">
                         <h3 className="font-semibold text-gray-700">Pindai untuk Setup</h3>
                         <div className="flex justify-center my-4">
                            {/* Placeholder untuk QR Code */}
                            <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                                <QrCode size={64}/>
                            </div>
                         </div>
                         <p className="text-xs text-gray-500">Pindai dengan aplikasi authenticator Anda, lalu simpan kode pemulihan di tempat aman.</p>
                     </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}