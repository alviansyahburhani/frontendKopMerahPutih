// Lokasi: frontend/app/dashboard/admin/sistem/log-audit/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { X, User, PlusCircle, History } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data ---
type LogAktivitas = {
  id: string;
  timestamp: string; // ISO 8601 format
  pengurus: {
    id: string;
    nama: string;
  };
  aksi: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  modul: string; // Contoh: 'Anggota', 'Simpanan', 'Pinjaman'
  detail: string;
};

// --- Data Contoh ---
const mockLog: LogAktivitas[] = [
  { id: 'log001', timestamp: '2025-09-15T10:30:00Z', pengurus: { id: 'pengurus01', nama: 'Andi Wijaya' }, aksi: 'CREATE', modul: 'Pinjaman', detail: 'Mencatat pinjaman baru untuk anggota Budi Santoso senilai Rp 1.500.000.' },
  { id: 'log002', timestamp: '2025-09-15T09:15:00Z', pengurus: { id: 'pengurus02', nama: 'Siti Aminah' }, aksi: 'UPDATE', modul: 'Anggota', detail: 'Memperbarui status anggota Citra Lestari menjadi "Berhenti".' },
  { id: 'log003', timestamp: '2025-09-15T08:05:00Z', pengurus: { id: 'pengurus01', nama: 'Andi Wijaya' }, aksi: 'LOGIN', modul: 'Sistem', detail: 'Berhasil login ke sistem.' },
  { id: 'log004', timestamp: '2025-09-14T15:00:00Z', pengurus: { id: 'pengurus01', nama: 'Andi Wijaya' }, aksi: 'DELETE', modul: 'Inventaris', detail: 'Menghapus data inventaris "Kursi Rapat Rusak" (INV-KR-05).' },
  { id: 'log005', timestamp: '2025-09-14T14:30:00Z', pengurus: { id: 'pengurus02', nama: 'Siti Aminah' }, aksi: 'CREATE', modul: 'Simpanan', detail: 'Mencatat setoran sukarela dari Alviansyah Burhani senilai Rp 250.000.' },
];


export default function LogAktivitasPage() {
  const [filters, setFilters] = useState({
    pengurus: '',
    aksi: '',
    modul: '',
    tanggalMulai: '',
    tanggalSelesai: ''
  });
  const [logList, setLogList] = useState<LogAktivitas[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogList(mockLog);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ pengurus: '', aksi: '', modul: '', tanggalMulai: '', tanggalSelesai: '' });
  };

  const filteredLog = useMemo(() => {
    return logList.filter(log => {
      const tanggalLog = new Date(log.timestamp);
      const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
      const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;

      if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
      if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);

      return (
        (filters.pengurus === '' || log.pengurus.nama.toLowerCase().includes(filters.pengurus.toLowerCase())) &&
        (filters.aksi === '' || log.aksi === filters.aksi) &&
        (filters.modul === '' || log.modul === filters.modul) &&
        (!tanggalMulai || tanggalLog >= tanggalMulai) &&
        (!tanggalSelesai || tanggalLog <= tanggalSelesai)
      );
    });
  }, [filters, logList]);

  const getAksiInfo = (aksi: LogAktivitas['aksi']) => {
    switch (aksi) {
      case 'CREATE': return { icon: PlusCircle, color: 'bg-green-100 text-green-600' };
      case 'UPDATE': return { icon: User, color: 'bg-blue-100 text-blue-600' };
      case 'DELETE': return { icon: X, color: 'bg-red-100 text-red-600' };
      case 'LOGIN': return { icon: User, color: 'bg-gray-100 text-gray-600' };
      default: return { icon: History, color: 'bg-gray-100 text-gray-600' };
    }
  };

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const LogAktivitasSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <Skeleton className="h-6 w-40 mb-6" />
          
        {/* Filter Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-8">
          <div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-10 w-full" /></div>
          <div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-10 w-full" /></div>
          <div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-10 w-full" /></div>
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 grid grid-cols-2 gap-2"><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
            <div><Skeleton className="h-10 w-full" /></div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-8 ml-8">
              <Skeleton className="absolute -left-5 w-8 h-8 rounded-full" />
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LogAktivitasSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Log Aktivitas Pengurus"
        description="Lacak semua perubahan dan aktivitas penting yang terjadi di dalam sistem."
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-700">Riwayat Aktivitas</h2>
          
          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="pengurus" className="block text-sm font-medium text-gray-600 mb-1">Nama Pengurus</label>
              <input id="pengurus" name="pengurus" type="text" placeholder="Cari nama..." value={filters.pengurus} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label htmlFor="aksi" className="block text-sm font-medium text-gray-600 mb-1">Jenis Aksi</label>
              <select id="aksi" name="aksi" value={filters.aksi} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
              </select>
            </div>
             <div>
              <label htmlFor="modul" className="block text-sm font-medium text-gray-600 mb-1">Modul</label>
              <select id="modul" name="modul" value={filters.modul} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Anggota">Anggota</option>
                <option value="Simpanan">Simpanan</option>
                <option value="Pinjaman">Pinjaman</option>
                <option value="Inventaris">Inventaris</option>
                <option value="Sistem">Sistem</option>
              </select>
            </div>
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Rentang Waktu</label>
                    <div className="flex items-center gap-2">
                        <input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                        <span className="text-gray-500">s/d</span>
                        <input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>
                 <div>
                     <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
                 </div>
            </div>
          </div>

        {/* --- Tampilan Log Linimasa --- */}
        <div className="relative border-l-2 border-gray-200 ml-4">
            {filteredLog.map((log) => {
                const { icon: Icon, color } = getAksiInfo(log.aksi);
                const dateTime = new Date(log.timestamp);
                const date = dateTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const time = dateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                
                return (
                    <div key={log.id} className="mb-8 ml-8">
                        <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full ${color}`}>
                            <Icon size={16}/>
                        </span>
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold text-gray-800">
                                    <span className="font-extrabold">{log.pengurus.nama}</span> melakukan aksi <span className="text-brand-red-600">{log.aksi}</span> pada modul <span className="font-extrabold">{log.modul}</span>
                                </p>
                                <time className="text-xs font-normal text-gray-500">{date} - {time}</time>
                            </div>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{log.detail}</p>
                        </div>
                    </div>
                );
            })}
             {filteredLog.length === 0 && (
                <div className="ml-8 text-center py-10 text-gray-500">
                    Tidak ada log aktivitas yang sesuai dengan filter.
                </div>
             )}
        </div>

      </div>
    </div>
  );
}