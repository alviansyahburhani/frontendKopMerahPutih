"use client";

import React, { useState, useEffect, memo, useMemo, useCallback, ChangeEvent, FormEvent } from "react";
import { 
  Landmark, Gem, CalendarClock, Inbox, AlertTriangle, 
  PlusCircle, ArrowDownCircle, X,
  ChevronLeft, ChevronRight, PieChart as PieChartIcon
} from "lucide-react"; // Impor ikon
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast"; // Perlu import Toaster

// --- Tipe Data (Sama seperti tipe data admin, tapi fokus pada satu anggota) ---
type SimpananTransaksi = {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  jenis: 'Pokok' | 'Wajib' | 'Sukarela';
  keterangan: string;
  tipe: 'Setoran' | 'Penarikan';
  jumlah: number;
  saldoAkhir?: number; // Saldo setelah transaksi (opsional, tergantung data API)
};

type SaldoAnggota = {
  pokok: number;
  wajib: number;
  sukarela: number;
  total: number;
};

// --- Data Contoh Anggota yang Login (Ganti dengan fetch API) ---
const mockSaldo: SaldoAnggota = {
  pokok: 500000,
  wajib: 4250000,
  sukarela: 1000000,
  total: 5750000,
};

// Menambahkan lebih banyak data untuk Paginasi
const mockTransaksi: SimpananTransaksi[] = [
  { id: 'trx001', tanggal: '2025-09-15', jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib September', jumlah: 100000, saldoAkhir: 5750000 },
  { id: 'trx002', tanggal: '2025-09-01', jenis: 'Sukarela', tipe: 'Setoran', keterangan: 'Setoran tunai via transfer', jumlah: 250000, saldoAkhir: 5650000 },
  { id: 'trx003', tanggal: '2025-08-15', jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib Agustus', jumlah: 100000, saldoAkhir: 5400000 },
  { id: 'trx004', tanggal: '2025-07-20', jenis: 'Sukarela', tipe: 'Penarikan', keterangan: 'Penarikan biaya pendidikan anak', jumlah: 500000, saldoAkhir: 5300000 },
  { id: 'trx005', tanggal: '2025-07-15', jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib Juli', jumlah: 100000, saldoAkhir: 5300000 },
  { id: 'trx006', tanggal: '2025-06-15', jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib Juni', jumlah: 100000, saldoAkhir: 5200000 },
  { id: 'trx007', tanggal: '2025-05-30', jenis: 'Sukarela', tipe: 'Setoran', keterangan: 'Setoran THR', jumlah: 1000000, saldoAkhir: 5100000 },
  { id: 'trx008', tanggal: '2025-05-15', jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib Mei', jumlah: 100000, saldoAkhir: 4100000 },
  { id: 'trx009', tanggal: '2025-04-15', jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib April', jumlah: 100000, saldoAkhir: 4000000 },
  { id: 'trx010', tanggal: '2025-01-15', jenis: 'Pokok', tipe: 'Setoran', keterangan: 'Simpanan Pokok Awal', jumlah: 500000, saldoAkhir: 500000 },
];
// ------------------------------------------------------------------

const TRANSAKSI_PER_HALAMAN = 5;

// --- Komponen UI Pendukung ---

// Komponen Skeleton
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
);

// Komponen Empty State
const EmptyState = memo(({
  icon: Icon,
  title,
  description,
} : {
  icon: React.ElementType,
  title: string,
  description: string,
}) => (
  <div className="text-center py-12 px-6">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-semibold text-gray-800">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
));
EmptyState.displayName = "EmptyState";

// --- BARU: Komponen Pie Chart Sederhana ---
const SimplePieChart = memo(({ data }: { data: { name: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-48 text-gray-500">Data saldo kosong.</div>;
  
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 140" className="w-48 h-48 -rotate-90">
        <circle
          cx="70" cy="70" r={radius}
          className="fill-none stroke-gray-100"
          strokeWidth="20"
        />
        {data.map((item) => {
          const percentage = (item.value / total);
          const dashArray = `${percentage * circumference} ${circumference}`;
          const dashOffset = -accumulatedPercentage * circumference;
          accumulatedPercentage += percentage;
          
          return (
            <circle
              key={item.name}
              cx="70" cy="70" r={radius}
              className="fill-none"
              strokeWidth="20"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              stroke={item.color}
            />
          );
        })}
      </svg>
      <div className="mt-4 space-y-2 text-sm">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600">{item.name}</span>
            <span className="font-semibold text-gray-800">Rp {item.value.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
SimplePieChart.displayName = "SimplePieChart";

// --- BARU: Komponen Modal Setor/Tarik ---
const SimpananModal = memo(({
  isOpen,
  onClose,
  onSubmit,
  tipe
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jumlah: number) => void;
  tipe: 'Setoran' | 'Penarikan';
}) => {
  const [jumlah, setJumlah] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJumlah("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (typeof jumlah === 'number' && jumlah > 0) {
      onSubmit(jumlah);
    } else {
      setError("Jumlah harus lebih besar dari 0.");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setJumlah("");
    } else {
      const num = parseFloat(val);
      if (num > 0) {
        setJumlah(num);
        setError(null);
      } else {
        setJumlah(num);
        setError("Jumlah harus valid.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            className="relative w-full max-w-md bg-white rounded-xl shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{tipe} Simpanan Sukarela</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  {tipe === 'Setoran'
                    ? 'Masukkan jumlah yang ingin Anda setorkan ke simpanan sukarela.'
                    : 'Masukkan jumlah yang ingin Anda tarik dari simpanan sukarela.'
                  }
                </p>
                <div>
                  <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
                    Jumlah (Rp)
                  </label>
                  <input
                    id="jumlah"
                    name="jumlah"
                    type="number"
                    value={jumlah}
                    onChange={handleChange}
                    className={clsx(
                      "mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2",
                      error ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                    )}
                    placeholder="Contoh: 50000"
                    min="1"
                  />
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={typeof jumlah !== 'number' || jumlah <= 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Konfirmasi {tipe}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
SimpananModal.displayName = "SimpananModal";

// Komponen Kartu Saldo (di-memo)
const SaldoCards = memo(({ saldo }: { saldo: SaldoAnggota }) => (
  <div className="space-y-4">
    {/* Kartu Pokok */}
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm flex items-center gap-4"
    >
      <div className="p-2 bg-blue-100 rounded-full"><Landmark className="h-5 w-5 text-blue-600" /></div>
      <div>
        <p className="text-sm font-semibold text-blue-800">Simpanan Pokok</p>
        <p className="text-xl font-bold text-blue-900">Rp {saldo.pokok.toLocaleString('id-ID')}</p>
      </div>
    </motion.div>
    
    {/* Kartu Wajib */}
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm flex items-center gap-4"
    >
      <div className="p-2 bg-green-100 rounded-full"><CalendarClock className="h-5 w-5 text-green-600" /></div>
      <div>
        <p className="text-sm font-semibold text-green-800">Simpanan Wajib</p>
        <p className="text-xl font-bold text-green-900">Rp {saldo.wajib.toLocaleString('id-ID')}</p>
      </div>
    </motion.div>
    
    {/* Kartu Sukarela */}
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm flex items-center gap-4"
    >
      <div className="p-2 bg-purple-100 rounded-full"><Gem className="h-5 w-5 text-purple-600" /></div>
      <div>
        <p className="text-sm font-semibold text-purple-800">Simpanan Sukarela</p>
        <p className="text-xl font-bold text-purple-900">Rp {saldo.sukarela.toLocaleString('id-ID')}</p>
      </div>
    </motion.div>
  </div>
));
SaldoCards.displayName = "SaldoCards";

// (Hapus komponen tabel animasi yang tidak dipakai untuk mengurangi overhead)


// --- Komponen Skeleton Halaman ---
const SimpananPageSkeleton = () => (
  <div>
    <Toaster position="top-right" />
    <div className="mb-8">
      <Skeleton className="h-9 w-1/3 mb-3" />
      <Skeleton className="h-5 w-1/2" />
    </div>
    
    {/* Layout Skeleton Baru */}
    <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Skeleton Chart */}
      <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-lg flex flex-col items-center">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-48 w-48 rounded-full mb-4" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      {/* Skeleton Saldo Cards */}
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
    
    {/* Skeleton Tabel */}
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);


// --- Komponen Halaman Utama ---
export default function SimpananAnggotaPage() {
  const [saldo, setSaldo] = useState<SaldoAnggota | null>(null);
  const [transaksi, setTransaksi] = useState<SimpananTransaksi[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Baru
  const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
  const [isTarikModalOpen, setIsTarikModalOpen] = useState(false);
  const [filterTipe, setFilterTipe] = useState<'Semua' | 'Setoran' | 'Penarikan'>('Semua');
  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Pokok' | 'Wajib' | 'Sukarela'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Simulasi Fetch Data ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaldo(mockSaldo);
      setTransaksi(mockTransaksi);
      setLoading(false);
    }, 1000); // Perpanjang durasi untuk melihat skeleton
    return () => clearTimeout(timer);
  }, []);
  // -------------------------

  // --- Logika Memoization untuk Filter & Paginasi ---
  const filteredTransaksi = useMemo(() => {
    return transaksi
      .filter(trx => (filterTipe === 'Semua' ? true : trx.tipe === filterTipe))
      .filter(trx => (filterJenis === 'Semua' ? true : trx.jenis === filterJenis));
  }, [transaksi, filterTipe, filterJenis]);

  // Reset halaman saat filter berubah (hindari setState di useMemo)
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTipe, filterJenis]);

  const totalPage = Math.ceil(filteredTransaksi.length / TRANSAKSI_PER_HALAMAN);

  const paginatedTransaksi = useMemo(() => {
    const start = (currentPage - 1) * TRANSAKSI_PER_HALAMAN;
    const end = start + TRANSAKSI_PER_HALAMAN;
    return filteredTransaksi.slice(start, end);
  }, [filteredTransaksi, currentPage]);
  
  const chartData = useMemo(() => {
      if (!saldo) return [];
      return [
          { name: 'Pokok', value: saldo.pokok, color: '#3b82f6' }, // blue-500
          { name: 'Wajib', value: saldo.wajib, color: '#22c55e' }, // green-500
          { name: 'Sukarela', value: saldo.sukarela, color: '#a855f7' }, // purple-500
      ];
  }, [saldo]);

  // --- Handlers (useCallback) ---
  const handleSetorSubmit = useCallback((jumlah: number) => {
    setIsSetorModalOpen(false);
    toast.loading('Memproses setoran...', { id: 'setor' });
    setTimeout(() => {
      toast.success(`Setoran Rp ${jumlah.toLocaleString('id-ID')} berhasil (simulasi)`, { id: 'setor' });
      // Di dunia nyata: fetch ulang data saldo & transaksi
    }, 1000);
  }, []);

  const handleTarikSubmit = useCallback((jumlah: number) => {
    if (saldo && jumlah > saldo.sukarela) {
        toast.error('Saldo sukarela tidak mencukupi!');
        return;
    }
    setIsTarikModalOpen(false);
    toast.loading('Memproses penarikan...', { id: 'tarik' });
    setTimeout(() => {
      toast.success(`Penarikan Rp ${jumlah.toLocaleString('id-ID')} berhasil (simulasi)`, { id: 'tarik' });
    }, 1000);
  }, [saldo]);
  
  const handleNextPage = () => {
      setCurrentPage(p => Math.min(p + 1, totalPage));
  };
  const handlePrevPage = () => {
      setCurrentPage(p => Math.max(p - 1, 1));
  };


  if (loading) {
    return <SimpananPageSkeleton />;
  }

  if (!saldo) {
    return (
      <div className="mt-10">
        <EmptyState 
          icon={AlertTriangle}
          title="Gagal Memuat Data"
          description="Terjadi kesalahan saat mengambil data simpanan Anda. Coba segarkan halaman."
        />
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      {/* --- Header Halaman Anggota --- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Rincian Simpanan Saya</h1>
        <p className="mt-2 text-gray-600">Lihat saldo, komposisi, dan riwayat transaksi simpanan Anda.</p>
      </motion.div>
      
      {/* --- Layout Grid Baru (Chart & Saldo) --- */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Total Saldo & Chart */}
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1 bg-white p-5 rounded-xl shadow-lg border border-gray-100"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-full"><PieChartIcon className="h-5 w-5 text-gray-600" /></div>
                <p className="text-sm font-semibold text-gray-800">Total Saldo Simpanan</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">Rp {saldo.total.toLocaleString('id-ID')}</p>
            <SimplePieChart data={chartData} />
        </motion.div>

        {/* Kolom Kanan: 3 Kartu Saldo */}
        <div className="lg:col-span-2">
            <SaldoCards saldo={saldo} />
        </div>
      </div>


      {/* --- Tabel Transaksi & Kontrol --- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">Riwayat Transaksi</h2>
            {/* Tombol Aksi */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsSetorModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    <PlusCircle size={14} /> Setor Sukarela
                </button>
                <button
                    onClick={() => setIsTarikModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <ArrowDownCircle size={14} /> Tarik Sukarela
                </button>
            </div>
          </div>

          {/* Kontrol Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Filter Tipe</label>
              <select 
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value as 'Semua' | 'Setoran' | 'Penarikan')}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="Semua">Semua Tipe</option>
                <option value="Setoran">Setoran</option>
                <option value="Penarikan">Penarikan</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Filter Jenis</label>
              <select 
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value as 'Semua' | 'Pokok' | 'Wajib' | 'Sukarela')}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Pokok">Pokok</option>
                <option value="Wajib">Wajib</option>
                <option value="Sukarela">Sukarela</option>
              </select>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Keterangan</th>
                  <th className="p-4 font-medium">Jenis</th>
                  <th className="p-4 font-medium text-right">Debit (Rp)</th>
                  <th className="p-4 font-medium text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody>
                  {paginatedTransaksi.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon={Inbox}
                          title="Tidak Ada Transaksi"
                          description="Tidak ada transaksi yang cocok dengan filter Anda."
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedTransaksi.map((trx) => (
                      <tr key={trx.id} className="border-b hover:bg-gray-50 text-sm">
                        <td className="p-4">{new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 text-gray-800">{trx.keterangan}</td>
                        <td className="p-4">
                          <span className={clsx(
                            'px-2 py-1 text-xs font-semibold rounded-full',
                            trx.jenis === 'Pokok' ? 'bg-blue-100 text-blue-700' :
                            trx.jenis === 'Wajib' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          )}>
                            {trx.jenis}
                          </span>
                        </td>
                        <td className="p-4 text-right text-red-600 font-medium">
                          {trx.tipe === 'Penarikan' ? trx.jumlah.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-4 text-right text-green-600 font-medium">
                          {trx.tipe === 'Setoran' ? trx.jumlah.toLocaleString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
          
          {/* Kontrol Paginasi */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
              <span className="text-sm text-gray-600">
                Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPage}</span>
              </span>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                      <ChevronLeft size={16} /> Prev
                  </button>
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPage}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                      Next <ChevronRight size={16} />
                  </button>
              </div>
          </div>

        </div>
      </motion.div>
      
      {/* --- Modals --- */}
      <SimpananModal 
        isOpen={isSetorModalOpen}
        onClose={() => setIsSetorModalOpen(false)}
        onSubmit={handleSetorSubmit}
        tipe="Setoran"
      />
      <SimpananModal 
        isOpen={isTarikModalOpen}
        onClose={() => setIsTarikModalOpen(false)}
        onSubmit={handleTarikSubmit}
        tipe="Penarikan"
      />

    </div>
  );
}
