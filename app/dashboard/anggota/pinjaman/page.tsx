"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
  FormEvent,
  memo, // Import memo
  useCallback, // Import useCallback
} from "react";
import {
  Banknote,
  CalendarClock,
  CheckCircle,
  Percent,
  PlusCircle,
  AlertTriangle,
  XCircle,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import clsx from "clsx";


// ----------------------
// Types (Tidak berubah)
// ----------------------
type PinjamanAnggota = {
  id: string;
  loanNumber: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  loanDate: string; // YYYY-MM-DD
  status: "Aktif" | "Lunas";
  sisaPokok: number;
  angsuranLunas: number;
  dueDate?: string; // YYYY-MM-DD
};

export type Angsuran = {
  id: string;
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate: string | null;
  totalAmount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
};

type AjukanPinjamanFormData = {
  jumlah: number | "";
  jangkaWaktu: number | "";
  tujuan: string;
};

// ----------------------
// Mock Data (Tidak berubah)
// ----------------------
const mockPinjamanList: PinjamanAnggota[] = [
  {
    id: "pinj002",
    loanNumber: "PJ-12346",
    loanAmount: 2_000_000,
    interestRate: 1.5,
    termMonths: 6,
    loanDate: "2025-07-15",
    status: "Aktif",
    sisaPokok: 1_000_000,
    angsuranLunas: 3,
    dueDate: "2026-01-15",
  },
  {
    id: "pinj004",
    loanNumber: "PJ-12348",
    loanAmount: 1_500_000,
    interestRate: 1.5,
    termMonths: 12,
    loanDate: "2025-09-05",
    status: "Aktif",
    sisaPokok: 1_375_000,
    angsuranLunas: 1,
    dueDate: "2026-09-05",
  },
  {
    id: "pinj001-lunas",
    loanNumber: "PJ-12340",
    loanAmount: 3_000_000,
    interestRate: 1.5,
    termMonths: 10,
    loanDate: "2024-11-10",
    status: "Lunas",
    sisaPokok: 0,
    angsuranLunas: 10,
    dueDate: "2025-09-10",
  },
];

const mockAngsuranDetail: Angsuran[] = [
  { id: "inst004", installmentNumber: 4, dueDate: "2025-11-15", paymentDate: null, totalAmount: 363_333, status: "PENDING" as const },
  { id: "inst005", installmentNumber: 5, dueDate: "2025-12-15", paymentDate: null, totalAmount: 363_333, status: "PENDING" as const },
  { id: "inst006", installmentNumber: 6, dueDate: "2026-01-15", paymentDate: null, totalAmount: 363_333, status: "PENDING" as const },
  { id: "inst000", installmentNumber: 3, dueDate: "2025-10-15", paymentDate: null, totalAmount: 363_333, status: "OVERDUE" as const },
  { id: "inst003", installmentNumber: 3, dueDate: "2025-10-15", paymentDate: "2025-10-10", totalAmount: 363_333, status: "PAID" as const },
  { id: "inst002", installmentNumber: 2, dueDate: "2025-09-15", paymentDate: "2025-09-12", totalAmount: 363_333, status: "PAID" as const },
  { id: "inst001", installmentNumber: 1, dueDate: "2025-08-15", paymentDate: "2025-08-14", totalAmount: 363_333, status: "PAID" as const },
].sort((a, b) => a.installmentNumber - b.installmentNumber);

// ----------------------
// TAMBAHKAN: Komponen Button Pengganti
// ----------------------
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
}

const Button = memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-red-600 text-white hover:bg-red-600 focus:ring-red-500",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-red-500"
    };

    const sizeStyles = {
      md: "px-4 py-2 text-sm",
      sm: "px-2.5 py-1.5 text-xs"
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
));
Button.displayName = "Button";

// ----------------------
// Small UI helpers
// ----------------------

// PERBAIKAN: Komponen dipindah ke luar dari PinjamanAnggotaPage
// dan dibungkus dengan memo()
const Section = memo(({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={clsx("bg-white/90 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-2xl", className)}>
    {children}
  </div>
));
// Menambahkan displayName untuk debugging yang lebih baik di React DevTools
Section.displayName = "Section"; 

function currency(n: number) {
  return n.toLocaleString("id-ID");
}

// PERBAIKAN: Komponen dipindah ke luar dan dibungkus memo()
const ProgressRing = memo(({ value }: { value: number }) => {
  const r = 42; // radius
  const c = 2 * Math.PI * r; // circumference
  const clamped = Math.min(100, Math.max(0, value));
  const dash = (clamped / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
      <circle cx="50" cy="50" r={r} className="fill-none stroke-gray-200" strokeWidth="10" />
      <motion.circle
        cx="50"
        cy="50"
        r={r}
        className="fill-none stroke-green-600"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c - dash}` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <text x="50" y="54" textAnchor="middle" className="fill-gray-800 font-semibold text-[14px]">
        {Math.round(clamped)}%
      </text>
    </svg>
  );
});
ProgressRing.displayName = "ProgressRing";

// ----------------------
// Modals
// ----------------------

// PERBAIKAN: Komponen Modal dipindah ke luar dan dibungkus memo()
const AjukanPinjamanModal = memo(({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AjukanPinjamanFormData) => void;
}) => {
  const [formData, setFormData] = useState<AjukanPinjamanFormData>({ jumlah: "", jangkaWaktu: "", tujuan: "" });

  useEffect(() => {
    if (isOpen) setFormData({ jumlah: "", jangkaWaktu: "", tujuan: "" });
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Section className="overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Ajukan Pinjaman Baru</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Tutup">
                  <XCircle size={22} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
                    Jumlah Pinjaman (Rp)*
                  </label>
                  <input
                    id="jumlah"
                    name="jumlah"
                    type="number"
                    min={100000}
                    step={50000}
                    required
                    value={formData.jumlah}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                    placeholder="Minimal 100.000"
                  />
                </div>
                <div>
                  <label htmlFor="jangkaWaktu" className="block text-sm font-medium text-gray-700">
                    Jangka Waktu (Bulan)*
                  </label>
                  <select
                    id="jangkaWaktu"
                    name="jangkaWaktu"
                    required
                    value={formData.jangkaWaktu === "" ? "" : String(formData.jangkaWaktu)}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <option value="">Pilih jangka waktu</option>
                    <option value="3">3 Bulan</option>
                    <option value="6">6 Bulan</option>
                    <option value="12">12 Bulan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tujuan" className="block text-sm font-medium text-gray-700">
                    Tujuan Pinjaman*
                  </label>
                  <textarea
                    id="tujuan"
                    name="tujuan"
                    rows={3}
                    required
                    value={formData.tujuan}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                    placeholder="Contoh: modal usaha, biaya pendidikan"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  <Button type="submit">Ajukan</Button>
                </div>
              </form>
            </Section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
AjukanPinjamanModal.displayName = "AjukanPinjamanModal";


// PERBAIKAN: Komponen Modal dipindah ke luar dan dibungkus memo()
const BayarTagihanModal = memo(({
  isOpen,
  onClose,
  onConfirm,
  angsuran,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (jumlahBayar: number) => void;
  angsuran: Angsuran | undefined;
  mode: "Awal" | "Wajib";
}) => {
  const [jumlahBayar, setJumlahBayar] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && angsuran) {
      setJumlahBayar(angsuran.totalAmount);
      setError(null);
    }
  }, [isOpen, angsuran]);

  const handleJumlahChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === "" ? "" : parseFloat(value);
    if (mode === "Awal" && angsuran) {
      if (numValue === "") {
        setJumlahBayar("");
        setError("Jumlah tidak boleh kosong.");
      } else if (typeof numValue === "number" && numValue > angsuran.totalAmount) {
        setError(`Jumlah maks: Rp ${currency(angsuran.totalAmount)}`);
        setJumlahBayar(numValue);
      } else if (typeof numValue === "number" && numValue <= 0) {
        setError("Jumlah harus > 0.");
        setJumlahBayar(numValue);
      } else {
        setError(null);
        setJumlahBayar(numValue as number);
      }
    }
  };

  const handleConfirmClick = () => {
    if (!error && jumlahBayar !== "" && jumlahBayar > 0) onConfirm(jumlahBayar);
    else if (mode === "Awal") setError(error || "Periksa jumlah.");
    else if (mode === "Wajib" && angsuran) onConfirm(angsuran.totalAmount);
  };

  return (
    <AnimatePresence>
      {isOpen && angsuran && (
        <motion.div className="fixed inset-0 z-70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Section className="overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  {mode === "Awal" ? "Bayar Lebih Awal" : "Bayar Tagihan"}
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Tutup">
                  <XCircle size={22} />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm text-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-gray-600">
                      Angsuran ke-<span className="font-semibold">{angsuran.installmentNumber}</span>
                    </p>
                    <p className="text-gray-600">
                      Jatuh Tempo: <span className="font-semibold">{new Date(angsuran.dueDate).toLocaleDateString("id-ID")}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Jumlah tagihan</p>
                    <p className="text-xl font-bold">Rp {currency(angsuran.totalAmount)}</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="jumlahBayar" className="block text-sm font-medium text-gray-700">
                    Jumlah Pembayaran (Rp)
                  </label>
                  <input
                    id="jumlahBayar"
                    name="jumlahBayar"
                    type="number"
                    value={jumlahBayar}
                    onChange={handleJumlahChange}
                    className={clsx(
                      "mt-1 w-full rounded-lg border p-2 focus:outline-none",
                      mode === "Wajib" ? "bg-gray-100" : "focus:ring-2 focus:ring-red-300",
                      error ? "border-red-500" : "border-gray-300"
                    )}
                    disabled={mode === "Wajib"}
                    max={mode === "Awal" ? angsuran.totalAmount : undefined}
                    min={mode === "Awal" ? 1 : undefined}
                    step={1000}
                  />
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                  {mode === "Awal" && !error && (
                    <p className="mt-1 text-xs text-gray-500">Maks. Rp {currency(angsuran.totalAmount)}</p>
                  )}
                  {mode === "Wajib" && (
                    <p className="mt-1 text-xs text-gray-500">Jumlah sesuai tagihan bulan ini.</p>
                  )}
                </div>

                {angsuran.status === "OVERDUE" && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle size={14} /> Angsuran ini sudah terlambat.
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="button" onClick={handleConfirmClick} disabled={mode === "Awal" && (jumlahBayar === "" || !!error)}>
                  Lanjutkan Pembayaran
                </Button>
              </div>
            </Section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
BayarTagihanModal.displayName = "BayarTagihanModal";


// ----------------------
// Page Component
// ----------------------
export default function PinjamanAnggotaPage() {
  const [pinjamanList, setPinjamanList] = useState<PinjamanAnggota[]>([]);
  const [selectedPinjamanId, setSelectedPinjamanId] = useState<string | null>(null);
  const [detailAngsuran, setDetailAngsuran] = useState<Angsuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAjukanModalOpen, setIsAjukanModalOpen] = useState(false);
  const [isBayarModalOpen, setIsBayarModalOpen] = useState(false);
  const [bayarModalMode, setBayarModalMode] = useState<"Awal" | "Wajib">("Wajib");
  const [angsuranUntukDibayar, setAngsuranUntukDibayar] = useState<Angsuran | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"tagihan" | "riwayat">("tagihan");
  const riwayatRef = useRef<HTMLDivElement>(null);

  // Simulasi fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setPinjamanList(mockPinjamanList);
      const aktif = mockPinjamanList.find((p) => p.status === "Aktif");
      if (aktif) {
        setSelectedPinjamanId(aktif.id);
        if (aktif.id === "pinj002") setDetailAngsuran([...mockAngsuranDetail]);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []); // [] = Hanya berjalan sekali saat mount

  // useMemo sudah Anda gunakan dengan SANGAT TEPAT.
  // Ini adalah optimasi yang bagus.
  const pinjamanTerpilih = useMemo(() => pinjamanList.find((p) => p.id === selectedPinjamanId), [selectedPinjamanId, pinjamanList]);

  const angsuranBerikutnya = useMemo(() => {
    return detailAngsuran.filter((a) => a.status === "PENDING" || a.status === "OVERDUE").sort((a, b) => a.installmentNumber - b.installmentNumber)[0];
  }, [detailAngsuran]);

  const totalTagihanBulanIni = useMemo(() => {
    if (!pinjamanTerpilih || pinjamanTerpilih.status === "Lunas") return 0;
    const now = new Date(); // 2025-10-24
    const m = now.getMonth(); // 9 (Oktober)
    const y = now.getFullYear(); // 2025

    return detailAngsuran.reduce((t, a) => {
      const d = new Date(a.dueDate); // misal: 2025-10-15
      const dm = d.getMonth(); // 9
      const dy = d.getFullYear(); // 2025
      
      // Jika status OVERDUE (pasti ditagih)
      if (a.status === "OVERDUE") return t + a.totalAmount;

      // Jika status PENDING, cek apakah jatuh temponya bulan ini atau bulan sebelumnya
      if (a.status === "PENDING" && dy === y && dm <= m) return t + a.totalAmount;
      
      // Jika PENDING tapi di tahun/bulan depan, atau sudah PAID, jangan tagih
      return t;
    }, 0);
  }, [detailAngsuran, pinjamanTerpilih]);

  const dataTabelAktif = useMemo(() => (activeTab === "tagihan" ? detailAngsuran.filter((a) => a.status !== "PAID") : detailAngsuran.filter((a) => a.status === "PAID")), [activeTab, detailAngsuran]);

  // PERBAIKAN: Bungkus handler yang di-pass ke komponen memo
  // dengan useCallback agar referensinya stabil.
  const handlePinjamanChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedPinjamanId(newId);
    setActiveTab("tagihan");
    if (newId === "pinj002") setDetailAngsuran([...mockAngsuranDetail]);
    else setDetailAngsuran([]);
    toast.success("Pinjaman diganti");
  }, []); // dependensi kosong karena hanya memakai state setters

  const handleProsesPembayaran = useCallback((jumlahBayar: number) => {
    setIsBayarModalOpen(false);
    if (!angsuranUntukDibayar) return;
    toast.loading("Memproses pembayaran…", { id: "pay" });
    setTimeout(() => {
      toast.success(`Pembayaran Rp ${currency(jumlahBayar)} diproses (simulasi)`, { id: "pay" });
      // TODO: Di sini Anda perlu mem-fetch ulang data angsuran
      // atau optimis mengubah state `detailAngsuran`
    }, 900);
  }, [angsuranUntukDibayar]); // dependensi pada `angsuranUntukDibayar`

  const handleAjukanPinjamanSubmit = useCallback((data: AjukanPinjamanFormData) => {
    toast.success(`Pengajuan Rp ${currency(Number(data.jumlah || 0))} untuk ${data.jangkaWaktu} bulan terkirim (simulasi)`);
    // TODO: Fetch ulang data pinjaman
  }, []);

  const handleBayarKlikUtama = useCallback(() => {
    if (!angsuranBerikutnya) return;
    const now = new Date();
    const due = new Date(angsuranBerikutnya.dueDate);
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const isBulanJatuhTempo = now.getFullYear() === due.getFullYear() && now.getMonth() === due.getMonth();
    const isTerlambat = now > due;
    
    // Mode "Wajib" jika sudah terlambat ATAU sudah masuk bulan jatuh tempo
    const mode: "Awal" | "Wajib" = (isTerlambat || isBulanJatuhTempo) ? "Wajib" : "Awal";
    
    setAngsuranUntukDibayar(angsuranBerikutnya);
    setBayarModalMode(mode);
    setIsBayarModalOpen(true);
  }, [angsuranBerikutnya]); // dependensi pada `angsuranBerikutnya`

  const handleBayarDariKartu = useCallback((a: Angsuran) => {
    setAngsuranUntukDibayar(a);
    // Saat klik 'Bayar' di kartu, selalu asumsikan bayar penuh (Wajib)
    setBayarModalMode("Wajib"); 
    setIsBayarModalOpen(true);
  }, []);

  // PERBAIKAN: Bungkus fungsi-fungsi ini dengan useCallback
  // agar bisa di-pass ke modal tanpa memutus memoization
  const closeAjukanModal = useCallback(() => setIsAjukanModalOpen(false), []);
  const closeBayarModal = useCallback(() => setIsBayarModalOpen(false), []);
  const openAjukanModal = useCallback(() => setIsAjukanModalOpen(true), []);


  if (loading) {
    return (
      <div className="pb-12">
        <div className="mb-8">
          <div className="h-9 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-14 bg-gray-100 rounded-lg" />
              <div className="h-14 bg-gray-100 rounded-lg" />
              <div className="h-14 bg-gray-100 rounded-lg" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-60 bg-gray-200 rounded" />
              </div>
              <div className="h-10 w-40 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            <div className="mt-6 grid gap-3">
              <div className="h-14 bg-gray-100 rounded-lg" />
              <div className="h-14 bg-gray-100 rounded-lg" />
              <div className="h-14 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <Toaster position="top-right" />

      {/* Hero / Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Pinjaman Saya</h1>
              <p className="mt-2 text-gray-600">Pantau status pinjaman, tagihan bulan ini, dan riwayat pembayaran Anda dengan mudah.</p>
            </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        {/* Switcher Pinjaman + CTA Ajukan */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 max-w-md">
            {pinjamanList.length > 1 && (
              <div>
                <label htmlFor="selectPinjaman" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Pinjaman
                </label>
                <select
                  id="selectPinjaman"
                  value={selectedPinjamanId ?? ""}
                  onChange={handlePinjamanChange}
                  className="w-full rounded-lg border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  {pinjamanList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.loanNumber} - {p.status} (Rp {currency(p.loanAmount)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Button onClick={openAjukanModal} variant="primary" className="self-start md:self-auto">
            <PlusCircle size={18} className="mr-2" /> Ajukan Pinjaman Baru
          </Button>
        </div>

        {/* Ringkasan Pinjaman */}
        {pinjamanTerpilih ? (
          <Section className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Ringkasan ({pinjamanTerpilih.loanNumber})</h2>
                  <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full", pinjamanTerpilih.status === "Aktif" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700")}>{pinjamanTerpilih.status}</span>
                </div>
                <p className="text-gray-500 mt-1 text-sm">Tgl Pinjam: {new Date(pinjamanTerpilih.loanDate).toLocaleDateString("id-ID")}</p>
              </div>

              {/* Progress ring */}
              {pinjamanTerpilih.status === "Aktif" && (
                <div className="flex items-center gap-4">
                  <ProgressRing value={(pinjamanTerpilih.angsuranLunas / pinjamanTerpilih.termMonths) * 100} />
                  <div className="text-sm">
                    <p className="text-gray-500">Pelunasan</p>
                    <p className="font-semibold">{pinjamanTerpilih.angsuranLunas} / {pinjamanTerpilih.termMonths} angsuran</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
              {/* ... data ringkasan ... */}
               <div className="rounded-xl border p-4">
                 <p className="text-gray-500 text-sm flex items-center gap-1"><Banknote size={14} /> Jumlah</p>
                 <p className="text-lg md:text-xl font-bold">Rp {currency(pinjamanTerpilih.loanAmount)}</p>
               </div>
               <div className="rounded-xl border p-4">
                 <p className="text-gray-500 text-sm flex items-center gap-1"><Percent size={14} /> Bunga</p>
                 <p className="text-lg md:text-xl font-bold">{pinjamanTerpilih.interestRate}% / bln</p>
               </div>
               <div className="rounded-xl border p-4">
                 <p className="text-gray-500 text-sm flex items-center gap-1"><CalendarClock size={14} /> Waktu</p>
                 <p className="text-lg md:text-xl font-bold">{pinjamanTerpilih.termMonths} bln</p>
               </div>
               {pinjamanTerpilih.dueDate && (
                 <div className="rounded-xl border p-4">
                   <p className="text-gray-500 text-sm flex items-center gap-1"><CalendarClock size={14} /> Tempo Lunas</p>
                   <p className="text-lg md:text-xl font-bold">{new Date(pinjamanTerpilih.dueDate).toLocaleDateString("id-ID")}</p>
                 </div>
               )}
            </div>

            {pinjamanTerpilih.status === "Aktif" && (
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm">
                  <p className="text-gray-500">Sisa Pokok</p>
                  <p className="text-base md:text-lg font-bold text-red-600">Rp {currency(pinjamanTerpilih.sisaPokok)}</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-center justify-between gap-6 w-full md:w-auto">
                  <div>
                    <p className="text-xs text-gray-600">Total Tagihan Bulan Ini</p>
                    <p className="text-xl md:text-2xl font-bold text-red-600">Rp {currency(totalTagihanBulanIni)}</p>
                    {detailAngsuran.some((a) => a.status === "OVERDUE") && (
                      <p className="text-xs text-red-500 mt-1">Termasuk tagihan terlambat.</p>
                    )}
                  </div>
                  <Button
                    onClick={handleBayarKlikUtama}
                    variant="primary"
                    disabled={!angsuranBerikutnya || totalTagihanBulanIni <= 0}
                    className="shrink-0"
                  >
                    <Wallet size={18} className="mr-2" /> Bayar Tagihan
                  </Button>
                </div>
              </div>
            )}
          </Section>
        ) : (
          <Section className="p-8 text-center text-gray-500">{pinjamanList.length > 0 ? "Pilih pinjaman." : "Tidak ada data pinjaman."}</Section>
        )}

        {/* Tabs */}
        <Section className="p-6 md:p-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("tagihan")}
              className={clsx(
                "px-3.5 py-2 rounded-full text-sm font-semibold",
                activeTab === "tagihan" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Tagihan ({detailAngsuran.filter((a) => a.status !== "PAID").length})
            </button>
            <button
              onClick={() => setActiveTab("riwayat")}
              className={clsx(
                "px-3.5 py-2 rounded-full text-sm font-semibold",
                activeTab === "riwayat" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Riwayat ({detailAngsuran.filter((a) => a.status === "PAID").length})
            </button>
          </div>
          
          {/* PERHATIAN: Daftar ini bisa menjadi berat jika `dataTabelAktif` sangat panjang.
              Pertimbangkan Paginasi atau Virtualization jika data bisa ratusan. */}
          <div ref={riwayatRef} className="mt-6 grid gap-3">
            {dataTabelAktif.length === 0 && (
              <p className="text-center text-gray-500 py-6">{activeTab === "tagihan" ? "Tidak ada tagihan." : "Belum ada riwayat."}</p>
            )}

            {dataTabelAktif.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border p-4 md:p-5 flex items-center justify-between gap-4 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">
                    Angsuran ke-<span className="font-semibold">{a.installmentNumber}</span>
                    {activeTab === "riwayat" && (
                      <>
                        {" "}• Dibayar: <span className="font-medium">{a.paymentDate ? new Date(a.paymentDate).toLocaleDateString("id-ID") : "-"}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Jatuh tempo {new Date(a.dueDate).toLocaleDateString("id-ID")}</p>
                </div>

                <div className="hidden md:block text-right">
                  <p className="text-xs text-gray-500">Jumlah</p>
                  <p className="font-semibold">Rp {currency(a.totalAmount)}</p>
                </div>

                <div className="flex items-center gap-3">
                  {activeTab === "tagihan" ? (
                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        a.status === "OVERDUE" ? "bg-red-100 text-red-700" : a.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700"
                      )}
                    >
                      {a.status}
                    </span>
                  ) : (
                    <CheckCircle className="text-green-600" size={18} />
                  )}

                  {activeTab === "tagihan" && (a.status === "PENDING" || a.status === "OVERDUE") && (
                    <Button size="sm" variant="outline" onClick={() => handleBayarDariKartu(a)}>
                      Bayar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Modals */}
      <AjukanPinjamanModal isOpen={isAjukanModalOpen} onClose={closeAjukanModal} onSubmit={handleAjukanPinjamanSubmit} />
      <BayarTagihanModal
        isOpen={isBayarModalOpen}
        onClose={closeBayarModal}
        onConfirm={handleProsesPembayaran}
        angsuran={angsuranUntukDibayar}
        mode={bayarModalMode}
      />
    </div>
  );
}
