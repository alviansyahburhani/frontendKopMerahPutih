// Lokasi: frontend/app/dashboard/anggota/saran/page.tsx
"use client";

import Button from "@/components/Button";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import clsx from "clsx";
// 1. Impor service, toast, dan tipe data
import toast, { Toaster } from 'react-hot-toast';
import { 
  memberService, 
  MemberSuggestionResponse, 
  SubmitSuggestionDto 
} from '@/services/member.service';
import { ApiErrorResponse } from "@/types/api.types";
import { CheckCircle } from "lucide-react";

// --- Data contoh dihapus ---

export default function HalamanSaranAnggota() {
  const [pageLoading, setPageLoading] = useState(true); // Loading untuk halaman
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading untuk form
  
  // 2. State untuk data dari API
  const [riwayatSaran, setRiwayatSaran] = useState<MemberSuggestionResponse[]>([]);
  const [suggestion, setSuggestion] = useState(""); // Mengganti 'pesan' dan 'subjek'

  // 3. Mengambil data riwayat saat halaman dimuat
  useEffect(() => {
    const loadRiwayat = async () => {
      setPageLoading(true);
      try {
        const data = await memberService.getMySuggestions();
        // Urutkan dari yang terbaru
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRiwayatSaran(data);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        toast.error(`Gagal memuat riwayat: ${apiError.message}`);
      } finally {
        setPageLoading(false);
      }
    };
    
    loadRiwayat();
  }, []); // [] = Hanya berjalan sekali

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
      </div>
    </div>
  );

  // 4. Modifikasi handleSubmitSaran untuk memanggil API
  const handleSubmitSaran = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!suggestion.trim()) {
      toast.error("Isi saran tidak boleh kosong.");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Mengirim saran...");

    const dto: SubmitSuggestionDto = {
      suggestion: suggestion.trim(),
    };

    try {
      const newSaran = await memberService.submitSuggestion(dto);
      toast.success("Saran Anda telah berhasil dikirim.", { id: toastId });
      
      // Update UI secara optimis (tambahkan ke atas daftar)
      setRiwayatSaran(prev => [newSaran, ...prev]);
      setSuggestion(""); // Kosongkan form
      
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal mengirim: ${apiError.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return <SaranSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-gray-800">Saran untuk Koperasi</h1>
      <p className="mt-2 text-gray-600">Sampaikan ide dan masukan Anda untuk kemajuan koperasi kita bersama.</p>

      {/* 5. Modifikasi Form (Subjek dihapus) */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Kirim Saran Baru</h2>
        <form onSubmit={handleSubmitSaran} className="space-y-4">
          {/* Field Subjek Dihapus */}
          <div>
            <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700">
              Isi Saran / Masukan Anda*
            </label>
            <textarea
              id="suggestion"
              name="suggestion" // Ganti nama
              rows={5}
              required
              value={suggestion} // Bind ke state 'suggestion'
              onChange={(e) => setSuggestion(e.target.value)} // Update state 'suggestion'
              disabled={isSubmitting} // Nonaktifkan saat mengirim
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-50"
              placeholder="Tuliskan saran atau masukan Anda secara detail di sini..."
            />
          </div>
          <div className="text-right">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim...' : 'Kirim Saran'}
            </Button>
          </div>
        </form>
      </div>

      {/* 6. Modifikasi Tabel Riwayat */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Saran Anda</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 font-medium">Tanggal Kirim</th>
                <th className="p-4 font-medium">Saran Anda</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Tanggapan Admin</th>
              </tr>
            </thead>
            <tbody>
              {riwayatSaran.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    Anda belum pernah mengirim saran.
                  </td>
                </tr>
              )}
              {riwayatSaran.map((saran) => {
                // Logika status berdasarkan 'response' dari backend
                const status = saran.response ? "Sudah Ditanggapi" : "Terkirim";
                
                return (
                  <tr key={saran.id} className="border-b hover:bg-gray-50 text-sm transition-colors duration-150">
                    <td className="p-4 align-top">
                      {new Date(saran.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-medium text-gray-800 align-top max-w-sm">
                      {/* Tampilkan isi saran (suggestion) */}
                      <p className="line-clamp-3">{saran.suggestion}</p>
                    </td>
                    <td className="p-4 text-center align-top">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        status === 'Terkirim' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 align-top max-w-sm">
                      {saran.response ? (
                        <div className="italic border-l-4 border-gray-200 pl-3">
                          <p className="font-semibold text-xs text-gray-500">
                            Ditanggapi oleh {saran.responseByUser?.fullName || 'Admin'}:
                          </p>
                          &quot;{saran.response}&quot;
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
