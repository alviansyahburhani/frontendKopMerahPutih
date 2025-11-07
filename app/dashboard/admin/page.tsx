// Lokasi: frontend/app/dashboard/admin/page.tsx
"use client";

import {
  Users,
  PiggyBank,
  HandCoins,
  UserPlus,
  ArrowUpRight,
  MessageSquare,
  Send,
  Landmark,
  BookUser,
  Archive,
  BookOpen,
  FileText,
  BookMarked,
  ClipboardList,
  Mail,
  Tag,
  AlertTriangle,
  ChevronRight,
  Briefcase,
  BookDown, 
  Library,
  ServerCrash, // Ikon untuk error
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, ElementType, ReactNode } from "react";
import clsx from "clsx";

// [FIX] Impor API dari file yang BENAR
import {
  simpananApi,
  loanApi,
  memberApi,
  type Loan,
  type SimpananTransaksi,
  type Member,
} from "@/lib/apiService"; // Untuk Keuangan & Anggota

import { 
  adminService,
  type MemberSuggestionResponse, // Impor tipe dari admin.service
} from "@/services/admin.service"; // Untuk Admin (Buku Tamu, Saran, Agenda)

import { 
  productsService 
} from "@/services/products.service"; // Untuk Katalog

// [FIX] Impor Tipe data dari file yang BENAR
import {
  type BukuTamu,
  type AgendaEkspedisi,
} from '@/types/api.types'; 

import {
  DashboardPieChart,
  DashboardBarChart,
  DashboardGrowthChart,
  DashboardCashflowChart,
} from "@/components/charts/DashboardCharts"; // Pastikan path ini benar

// --- Helper Functions ---
const formatCurrency = (value: number) => {
  const absolute = Math.abs(value);
  const formatted = absolute.toLocaleString("id-ID");
  return `${value < 0 ? "-" : ""}Rp${formatted}`;
};

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --- Tipe Data ---
type CatalogSummary = {
  totalProducts: number;
  availableProducts: number;
  unavailableProducts: number;
  categoryCount: number;
  categories: { name: string; count: number }[];
  recentProducts: {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
    categoryName: string;
    updatedAt: string;
  }[];
};

type TimeRange = 'daily' | 'monthly' | 'yearly';

// --- Komponen Dashboard Utama ---

type StatCardProps = {
  icon: ElementType;
  title: string;
  value: number;
  change?: number;
  color: string;
  unit?: string;
};

const StatCard = ({
  icon,
  title,
  value,
  change,
  color,
  unit = "",
}: StatCardProps) => {
  const IconComponent = icon;
  const hasChange = typeof change === "number";
  const isPositive = hasChange ? (change as number) >= 0 : true;
  const changeValue = change ?? 0;

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <IconComponent className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {unit}
            {value.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      {/* Kita sembunyikan 'change' jika 0, karena kita tidak menghitungnya */}
      {hasChange && changeValue !== 0 && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={clsx(
              "flex items-center font-semibold",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            <ArrowUpRight
              size={14}
              className={clsx({ "transform rotate-180": !isPositive })}
            />
            {Math.abs(changeValue)}%
          </span>
          <span className="text-gray-500">vs bulan lalu</span>
        </div>
      )}
    </div>
  );
};

// Komponen Wrapper untuk semua daftar
type InfoListBoxProps = {
  title: string;
  children: ReactNode;
  viewMoreLink?: string;
  className?: string;
  controls?: ReactNode; // Prop baru
};

const InfoListBox = ({ title, children, viewMoreLink, controls, className }: InfoListBoxProps) => (
  <div className={clsx(
    "bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full",
    className
  )}>
    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      {/* Render controls (toggle) atau viewMoreLink */}
      {controls ? controls : (
        viewMoreLink && (
          <Link
            href={viewMoreLink}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Lihat semua <ChevronRight size={14} />
          </Link>
        )
      )}
    </div>
    <div className="flow-root">
      {children}
    </div>
  </div>
);

// Komponen Toggle Pilihan Waktu
type TimeRangeToggleProps = {
  currentTimeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
};

const TimeRangeToggle = ({ currentTimeRange, setTimeRange }: TimeRangeToggleProps) => {
  const buttons: { label: string; range: TimeRange }[] = [
    { label: "Harian", range: 'daily' },    // 7 hari
    { label: "Bulanan", range: 'monthly' }, // 12 bulan
    { label: "Tahunan", range: 'yearly' },  // 5 tahun
  ];

  return (
    <div className="flex bg-gray-100 p-0.5 rounded-lg">
      {buttons.map((btn) => (
        <button
          key={btn.range}
          onClick={() => setTimeRange(btn.range)}
          className={clsx(
            "text-xs font-semibold py-1 px-3 rounded-md transition-all",
            currentTimeRange === btn.range
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};


// Komponen Kartu Tugas Cepat (Informatif)
type QuickTaskCardProps = {
  icon: ElementType;
  title: string;
  count: number;
  href: string;
  color: string;
};

const QuickTaskCard = ({
  icon,
  title,
  count,
  href,
  color,
}: QuickTaskCardProps) => {
  const Icon = icon;
  return (
    <Link
      href={href}
      className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 flex items-center justify-between hover:bg-${color}-100 transition-colors`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 text-${color}-700`} />
        <span className={`font-semibold text-${color}-800`}>{title}</span>
      </div>
      {count > 0 && (
        <span
          className={`font-bold text-sm text-white bg-${color}-500 rounded-full px-2.5 py-0.5`}
        >
          {count}
        </span>
      )}
    </Link>
  );
};

// --- SKELETON & DATA DUMMY SEKRETARIS (Biarkan) ---
const DashboardSkeleton = ({
  showMemberSections,
  showFinanceSections,
}: {
  showMemberSections: boolean;
  showFinanceSections: boolean;
}) => {
  const statSkeletonCount = Math.max(
    (showMemberSections ? 1 : 0) + (showFinanceSections ? 2 : 0),
    1
  );

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="h-9 w-1/3 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-5 w-1/2 rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div
        className={clsx(
          "grid grid-cols-1 gap-6 mt-8",
          statSkeletonCount >= 2 && "md:grid-cols-2",
          statSkeletonCount >= 3 && "lg:grid-cols-3"
        )}
      >
        {Array.from({ length: statSkeletonCount }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded-md bg-gray-200 animate-pulse" />
                <div className="h-7 w-20 rounded-md bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div className="mt-4 h-5 w-1/2 rounded-md bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg h-80">
          <div className="h-6 w-40 mb-4 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-64 w-full rounded-md bg-gray-200 animate-pulse" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg h-80">
          <div className="h-6 w-40 mb-4 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-64 w-full rounded-md bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// [DUMMY] Data dummy untuk sekretaris (karena API belum dibuat)
const documentBacklog = [
  {
    title: "Notulen Rapat Pengurus Agustus",
    owner: "Sekretariat",
    status: "Menunggu tanda tangan",
  },
  {
    title: "Surat keluar - Undangan Musyawarah",
    owner: "Sekretariat",
    status: "Dalam proses distribusi",
  },
  {
    title: "Dokumen pencairan pinjaman BUD-231",
    owner: "Keuangan",
    status: "Perlu pengarsipan",
  },
];

const correspondenceQueue = [
  {
    sender: "Dinas Koperasi Kota",
    subject: "Permintaan laporan triwulan",
    receivedAt: "10 Sep 2025",
  },
  {
    sender: "Koperasi Maju Makmur",
    subject: "Undangan forum benchmarking",
    receivedAt: "09 Sep 2025",
  },
];
// Akhir data dummy sekretaris

// --- Helper untuk membuat data tren ---
const getTrendData = (
  transactions: any[], 
  dateKey: string, 
  valueKey: string | number, 
  timeRange: TimeRange, 
  typeKey?: string, 
  typeValue?: string
): { name: string; value: number }[] => {
  const now = new Date();
  const data: { name: string; value: number }[] = [];
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  if (timeRange === 'daily') {
    // 7 hari terakhir
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = dayNames[d.getDay()];
      data.push({ name: `${dayName}, ${d.getDate()}`, value: 0 });
    }
    
    transactions.forEach((trx) => {
      if (!trx[dateKey]) return;
      if (typeKey && trx[typeKey] !== typeValue) return;

      const trxDate = new Date(trx[dateKey]);
      
      // Set jam ke 0 untuk perbandingan tanggal yang adil
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const itemDate = new Date(trxDate.getFullYear(), trxDate.getMonth(), trxDate.getDate());

      const diffTime = today.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 6) {
        const bucketIndex = 6 - diffDays;
        const value = typeof valueKey === 'number' ? valueKey : trx[valueKey];
        data[bucketIndex].value += Number(value) || 0;
      }
    });
  } else if (timeRange === 'monthly') {
    // 12 bulan terakhir
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear().toString().slice(-2);
      const monthName = monthNames[d.getMonth()];
      data.push({ name: `${monthName} '${year}`, value: 0 });
    }

    transactions.forEach((trx) => {
      if (!trx[dateKey]) return;
      if (typeKey && trx[typeKey] !== typeValue) return;

      const trxDate = new Date(trx[dateKey]);
      const trxYear = trxDate.getFullYear();
      const trxMonth = trxDate.getMonth();

      for (const item of data) {
        const [monthName, yearSuffix] = item.name.split(" ");
        const year = parseInt(`20${yearSuffix.replace("'", "")}`);
        const monthIndex = monthNames.indexOf(monthName);
        if (trxYear === year && trxMonth === monthIndex) {
          const value = typeof valueKey === 'number' ? valueKey : trx[valueKey];
          item.value += Number(value) || 0;
          break;
        }
      }
    });
  } else if (timeRange === 'yearly') {
    // 5 tahun terakhir
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      data.push({ name: year.toString(), value: 0 });
    }

    transactions.forEach((trx) => {
      if (!trx[dateKey]) return;
      if (typeKey && trx[typeKey] !== typeValue) return;

      const trxYear = new Date(trx[dateKey]).getFullYear();
      const item = data.find(d => d.name === trxYear.toString());
      if (item) {
        const value = typeof valueKey === 'number' ? valueKey : trx[valueKey];
        item.value += Number(value) || 0;
      }
    });
  }
  return data;
};

// Helper untuk data arus kas (karena butuh 2 bar)
const getCashflowTrendData = (
  transactions: SimpananTransaksi[], 
  timeRange: TimeRange
) => {
  const setoranData = getTrendData(transactions, "createdAt", "jumlah", timeRange, "tipe", "SETORAN");
  const penarikanData = getTrendData(transactions, "createdAt", "jumlah", timeRange, "tipe", "PENARIKAN");
  
  return setoranData.map((item, index) => ({
    name: item.name,
    Setoran: item.value,
    Penarikan: penarikanData[index].value,
  }));
};


// --- Komponen Halaman Utama ---
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [boardPositions, setBoardPositions] = useState<string[] | null>(null);
  const [boardPositionsStatus, setBoardPositionsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [boardPositionsError, setBoardPositionsError] = useState<string | null>(
    null
  );
  
  // [REAL] State untuk semua data dari API
  const [loanList, setLoanList] = useState<Loan[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [simpananTransactionsList, setSimpananTransactionsList] = useState<
    SimpananTransaksi[]
  >([]);
  const [catalogSummary, setCatalogSummary] = useState<CatalogSummary | null>(
    null
  );
  const [catalogSummaryError, setCatalogSummaryError] = useState<
    string | null
  >(null);
  const [bukuTamuList, setBukuTamuList] = useState<BukuTamu[]>([]);
  const [agendaList, setAgendaList] = useState<AgendaEkspedisi[]>([]);
  const [saranAnggotaList, setSaranAnggotaList] = useState<MemberSuggestionResponse[]>([]); // [FIX] Gunakan tipe yg benar
  const [saranPengawasList, setSaranPengawasList] = useState<MemberSuggestionResponse[]>([]); // [FIX] Gunakan tipe yg benar
  
  // State untuk filter waktu
  const [cashflowTimeRange, setCashflowTimeRange] = useState<TimeRange>('monthly');
  const [loanTimeRange, setLoanTimeRange] = useState<TimeRange>('monthly');
  const [memberTimeRange, setMemberTimeRange] = useState<TimeRange>('monthly');
  
  // [REAL] State untuk data KPI utama
  const [namaKoperasi, setNamaKoperasi] = useState("Koperasi Anda");
  const [totalAnggota, setTotalAnggota] = useState(0);
  const [totalSimpanan, setTotalSimpanan] = useState(0);
  const [totalPinjamanBeredar, setTotalPinjamanBeredar] = useState(0);
  const [pendaftarBaruCount, setPendaftarBaruCount] = useState(0);
  const [anggotaTerbaruList, setAnggotaTerbaruList] = useState<{ nama: string; tanggalMasuk: string }[]>([]);
  const [aktivitasTerbaruList, setAktivitasTerbaruList] = useState<{ ikon: ElementType; teks: string; waktu: string }[]>([]);


  useEffect(() => {
    let isMounted = true;

    const loadBoardPositions = async () => {
      try {
        if (!isMounted) {
          return;
        }
        setBoardPositionsStatus("loading");
        setBoardPositionsError(null);
        const positions = await adminService.getMyActiveBoardPositions();
        if (!isMounted) return;

        const uniquePositions = Array.from(
          new Set(
            positions
              .map((position) => position.jabatan)
              .filter((jabatan) => Boolean(jabatan?.trim()))
          )
        );
        setBoardPositions(uniquePositions);
        setBoardPositionsStatus("success");
      } catch (error) {
        console.warn("Gagal mengambil jabatan pengurus aktif:", error);
        if (isMounted) {
          setBoardPositionsStatus("error");
          setBoardPositionsError(
            error instanceof Error ? error.message : "Tidak dapat memuat jabatan."
          );
          setBoardPositions([]);
          setLoading(false);
        }
      }
    };

    loadBoardPositions().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (boardPositionsStatus !== "success" || boardPositions === null) {
      return;
    }

    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);

      const normalized = boardPositions
        .map((pos) => pos.toLowerCase())
        .filter(Boolean);
      const canAccessFinance = normalized.includes("bendahara");
      const canAccessMembership = normalized.some((role) =>
        ["ketua", "sekretaris"].includes(role)
      );

      try {
        let catalogErrorMessage: string | null = null;

        // [FIX] Memanggil API dari service yang BENAR
        const [
          simpananData, 
          loanData, 
          memberData, 
          catalogData,
          bukuTamuData,
          agendaData,
          saranAnggotaData,
          saranPengawasData
        ] = await Promise.all([
            // Data Bendahara (lib/apiService.ts)
            canAccessFinance
              ? simpananApi.getAllTransactions().catch((error) => {
                  console.warn("Data simpanan tidak dapat diakses:", error);
                  return [] as SimpananTransaksi[];
                })
              : Promise.resolve([] as SimpananTransaksi[]),
            canAccessFinance
              ? loanApi.getAllLoans().catch((error) => {
                  console.warn("Data pinjaman tidak dapat diakses:", error);
                  return [] as Loan[];
                })
              : Promise.resolve([] as Loan[]),
            
            // Data Keanggotaan (lib/apiService.ts)
            canAccessMembership
              ? memberApi.getAllMembers().catch((error) => {
                  console.warn("Data anggota tidak dapat diakses:", error);
                  return [] as Member[];
                })
              : Promise.resolve([] as Member[]),
            
            // Data Katalog (services/products.service.ts)
            canAccessFinance
              ? productsService
                  .getAllProducts(1, 100)
                  .catch((error) => {
                    console.warn("Data katalog tidak dapat diakses:", error);
                    catalogErrorMessage =
                      error instanceof Error
                        ? error.message
                        : "Data katalog tidak dapat diakses.";
                    return null;
                  })
              : Promise.resolve(null),
              
            // Data Administrasi (services/admin.service.ts)
            canAccessMembership
              ? adminService.getGuestBookEntries().catch((err) => { // [FIX]
                  console.warn("Data Buku Tamu tidak dapat diakses:", err);
                  return [] as BukuTamu[];
                })
              : Promise.resolve([] as BukuTamu[]),
            canAccessMembership
              ? adminService.getAgendaExpeditions().catch((err) => { // [FIX]
                  console.warn("Data Agenda tidak dapat diakses:", err);
                  return [] as AgendaEkspedisi[];
                })
              : Promise.resolve([] as AgendaEkspedisi[]),
            canAccessMembership
              ? adminService.getMemberSuggestions().catch((err) => { // [FIX]
                  console.warn("Data Saran Anggota tidak dapat diakses:", err);
                  return [] as MemberSuggestionResponse[];
                })
              : Promise.resolve([] as MemberSuggestionResponse[]),
            canAccessMembership
              ? adminService.getSupervisorSuggestions().catch((err) => { // [FIX] - Asumsi fungsi ini sudah ditambah
                  console.warn("Data Saran Pengawas tidak dapat diakses:", err);
                  return [] as MemberSuggestionResponse[];
                })
              : Promise.resolve([] as MemberSuggestionResponse[]),
          ]);

        if (!isMounted) {
          return;
        }

        // [REAL] Menyimpan semua data real ke state
        setSimpananTransactionsList(simpananData);
        setLoanList(loanData);
        setMemberList(memberData);
        setBukuTamuList(bukuTamuData);
        setAgendaList(agendaData);
        setSaranAnggotaList(saranAnggotaData);
        setSaranPengawasList(saranPengawasData);

        // ... (Logika catalogSummary tetap sama) ...
        if (!canAccessFinance) {
          setCatalogSummary(null);
          setCatalogSummaryError(null);
        } else if (catalogData && Array.isArray(catalogData.data)) {
          const products = catalogData.data;
          const totalProducts =
            catalogData.meta?.totalItems && catalogData.meta.totalItems > 0
              ? catalogData.meta.totalItems
              : products.length;
          const availableProducts = products.filter(
            (prod) => prod.isAvailable
          ).length;
          const visibleUnavailable = products.filter(
            (prod) => !prod.isAvailable
          ).length;
          const unavailableProducts =
            catalogData.meta?.totalItems && catalogData.meta.totalItems > 0
              ? Math.max(totalProducts - availableProducts, visibleUnavailable)
              : visibleUnavailable;

          const categoryCounts = products.reduce(
            (acc, prod) => {
              const name = prod.category?.name ?? "Lainnya";
              acc[name] = (acc[name] ?? 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );
          const categoryEntries = Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          const categories = categoryEntries.slice(0, 5); // Ambil top 5

          const recentProducts = products
            .slice()
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
            .slice(0, 8)
            .map((prod) => ({
              id: prod.id,
              name: prod.name,
              price: prod.price,
              isAvailable: prod.isAvailable,
              categoryName: prod.category?.name ?? "Tidak diketahui",
              updatedAt: prod.updatedAt,
            }));

          setCatalogSummary({
            totalProducts,
            availableProducts,
            unavailableProducts,
            categoryCount: categoryEntries.length,
            categories,
            recentProducts,
          });
          setCatalogSummaryError(null);
        } else {
          setCatalogSummary(null);
          setCatalogSummaryError(
            catalogErrorMessage ?? "Data katalog belum tersedia."
          );
        }
        
        // --- [REAL] Set State Real (Hapus createDashboardData) ---
        let totalSimpanan = 0;
        simpananData.forEach((trx) => {
          const sign = trx.tipe === "SETORAN" ? 1 : -1;
          totalSimpanan += trx.jumlah * sign;
        });

        const totalPinjamanBeredar = loanData
          .filter((loan) => loan.status !== "PAID_OFF" && loan.status !== "REJECTED")
          .reduce((sum, loan) => sum + loan.loanAmount, 0);

        const pendaftarBaru = memberData.filter(m => m.status === 'PENDING').length;

        const anggotaTerbaru = memberData
          .filter(m => m.status === 'ACTIVE')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(m => ({ nama: m.fullName, tanggalMasuk: formatDate(m.createdAt) }));

        // Buat aktivitas terbaru dari data yg ada
        const aktivitas: { date: Date, ikon: ElementType, teks: string }[] = [
          ...loanData.slice(0, 5).map(l => ({ date: new Date(l.createdAt), ikon: HandCoins, teks: `Pinjaman baru untuk ${l.member?.fullName || 'anggota'}.` })),
          ...simpananData.filter(s => s.tipe === 'SETORAN').slice(0, 5).map(s => ({ date: new Date(s.createdAt), ikon: Landmark, teks: `Setoran ${s.tipeSimpanan} dari ${s.member?.fullName || 'anggota'}.` })),
          ...memberData.slice(0, 5).map(m => ({ date: new Date(m.createdAt), ikon: UserPlus, teks: `${m.fullName} telah bergabung.` }))
        ];
        
        const aktivitasTerbaru = aktivitas
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5) // Ambil 5 terbaru
          .map(item => ({ ikon: item.ikon, teks: item.teks, waktu: formatDate(item.date) }));
        
        // Set State Real
        setNamaKoperasi(memberData.length > 0 ? (memberData[0] as any).koperasi?.name || "Koperasi Anda" : "Koperasi Anda");
        setTotalAnggota(memberData.filter(m => m.status === 'ACTIVE').length);
        setTotalSimpanan(totalSimpanan);
        setTotalPinjamanBeredar(totalPinjamanBeredar);
        setPendaftarBaruCount(pendaftarBaru);
        setAnggotaTerbaruList(anggotaTerbaru);
        setAktivitasTerbaruList(aktivitasTerbaru as any[]);
        // --- Akhir Pembuatan Data Real ---

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        if (isMounted) {
          // Reset semua state
          setSimpananTransactionsList([]);
          setLoanList([]);
          setMemberList([]);
          setBukuTamuList([]);
          setAgendaList([]);
          setSaranAnggotaList([]);
          setSaranPengawasList([]);
          setCatalogSummary(null);
          
          setBoardPositionsError(
             error instanceof Error ? error.message : "Gagal memuat data dashboard. Periksa koneksi backend."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [boardPositionsStatus, boardPositions]);

  const normalizedPositions = useMemo(
    () =>
      boardPositions
        ?.map((pos) => pos.toLowerCase().trim())
        .filter(Boolean) ?? [],
    [boardPositions]
  );
  const hasRoleAssignments = normalizedPositions.length > 0;
  const isTreasurer = normalizedPositions.includes("bendahara");
  const isChair = normalizedPositions.includes("ketua");
  const isSecretary = normalizedPositions.includes("sekretaris");
  
  // --- KUMPULAN DATA useMemo UNTUK SEMUA ROLE ---

  // Data Keuangan (Bendahara & Ketua)
  const outstandingLoans = useMemo(
    () => loanList.filter((loan) => loan.status !== "PAID_OFF" && loan.status !== "REJECTED"),
    [loanList]
  );
  const outstandingLoanTotal = useMemo(
    () => outstandingLoans.reduce((sum, loan) => sum + loan.loanAmount, 0),
    [outstandingLoans]
  );

  const { overdueLoansValue, onTimeLoansValue, overdueLoansCount } = useMemo(() => {
    const now = new Date();
    let overdueValue = 0;
    let onTimeValue = 0;
    let overdueCount = 0;

    outstandingLoans
      .filter(loan => loan.status === "ACTIVE") // Hanya hitung yang sudah AKTIF
      .forEach((loan) => {
      if (!loan.dueDate) {
        onTimeValue += loan.loanAmount;
        return;
      }
      const due = new Date(loan.dueDate);
      if (Number.isNaN(due.getTime()) || due >= now) {
        onTimeValue += loan.loanAmount;
      } else {
        // Ini adalah pinjaman overdue
        overdueValue += loan.loanAmount;
        overdueCount++;
      }
    });
    return { overdueLoansValue: overdueValue, onTimeLoansValue: onTimeValue, overdueLoansCount: overdueCount };
  }, [outstandingLoans]);
  
  
  const averageLoanValue = outstandingLoans.length
    ? Math.round(outstandingLoanTotal / outstandingLoans.length)
    : 0;

  const upcomingDueLoans = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime());
    limit.setDate(limit.getDate() + 30);

    return outstandingLoans
      .filter((loan) => {
        if (!loan.dueDate || loan.status !== "ACTIVE") return false; // Hanya pinjaman aktif
        const due = new Date(loan.dueDate);
        if (Number.isNaN(due.getTime())) return false;
        return due >= now && due <= limit; // Antara sekarang dan 30 hari ke depan
      })
      .sort((a, b) => {
        const dueA = new Date(a.dueDate ?? 0).getTime();
        const dueB = new Date(b.dueDate ?? 0).getTime();
        return dueA - dueB;
      })
      .slice(0, 5)
      .map((loan) => {
        const due = new Date(loan.dueDate ?? 0);
        const diff = Math.ceil(
          (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: loan.id,
          borrower: loan.member?.fullName ?? "Anggota",
          dueDate: formatDate(due),
          amount: loan.loanAmount,
          daysLeft: diff,
        };
      });
  }, [outstandingLoans]);

  const netSimpananMovement = useMemo(
    () =>
      simpananTransactionsList.reduce((acc, trx) => {
        const sign = trx.tipe === "SETORAN" ? 1 : -1;
        return acc + trx.jumlah * sign;
      }, 0),
    [simpananTransactionsList]
  );

  // Data Keanggotaan (Ketua)
  const inactiveMembers = useMemo(
    () =>
      memberList.filter(
        (member) => member.status && member.status !== "ACTIVE"
      ).length,
    [memberList]
  );
  
  // [REAL] Data list untuk Ketua
  const recentBukuTamu = useMemo(() => {
    return bukuTamuList
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Ambil 5 terbaru
  }, [bukuTamuList]);

  const upcomingAgenda = useMemo(() => {
    const now = new Date();
    return agendaList
      .filter(agenda => new Date(agenda.tanggal) >= now) // Hanya agenda yg akan datang
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .slice(0, 5); // Ambil 5 terdekat
  }, [agendaList]);
  
  // [REAL] Data count untuk Tugas Cepat
  const saranAnggotaCount = useMemo(() => {
    // [FIX] Logika disesuaikan dengan tipe data `MemberSuggestionResponse`
    return saranAnggotaList.filter(s => s.response === null).length;
  }, [saranAnggotaList]);
  
  const saranPengawasCount = useMemo(() => {
    // [FIX] Logika disesuaikan dengan tipe data `MemberSuggestionResponse`
    return saranPengawasList.filter(s => s.response === null).length;
  }, [saranPengawasList]);
  
  const totalSaranCount = saranAnggotaCount + saranPengawasCount;
  
  // --- DATA CHARTS ---
  
  // [REAL] Data Komposisi Saldo Simpanan (Bendahara)
  const simpananCompositionChartData = useMemo(() => {
    const totals = {
      POKOK: 0,
      WAJIB: 0,
      SUKARELA: 0,
    };

    simpananTransactionsList.forEach((trx) => {
      const sign = trx.tipe === "SETORAN" ? 1 : -1;
      // Gunakan 'tipeSimpanan' yang ada di SimpananTransaksi
      if (trx.tipeSimpanan && totals.hasOwnProperty(trx.tipeSimpanan)) {
        totals[trx.tipeSimpanan] += trx.jumlah * sign;
      }
    });

    return [
      { name: "Pokok", value: totals.POKOK },
      { name: "Wajib", value: totals.WAJIB },
      { name: "Sukarela", value: totals.SUKARELA },
    ].filter(item => item.value > 0); // Hanya tampilkan yg ada nilainya
  }, [simpananTransactionsList]);
  
  const simpananCompositionColors = ["#0EA5E9", "#14B8A6", "#22C55E"]; // sky, teal, green

  // [REAL] Data Status Portofolio Pinjaman (Bendahara)
  const loanPortfolioChartData = useMemo(() => {
     return [
      { name: "Lancar", value: onTimeLoansValue },
      { name: "Menunggak", value: overdueLoansValue },
    ].filter(item => item.value > 0);
  }, [onTimeLoansValue, overdueLoansValue]);
  
  const loanPortfolioColors = ["#22C55E", "#F97316"]; // green, orange
  
  // [REAL] Data Arus Kas Simpanan (Bendahara) - Dinamis
  const simpananCashflowChartData = useMemo(() => {
    return getCashflowTrendData(simpananTransactionsList, cashflowTimeRange);
  }, [simpananTransactionsList, cashflowTimeRange]);
  
  // [REAL] Data Pencairan Pinjaman (Bendahara) - Dinamis
  const loanDisbursalChartData = useMemo(() => {
    // Kita filter loanList hanya untuk pinjaman yg 'ACTIVE' (sudah dicairkan)
    const activeLoans = loanList.filter(loan => loan.status === "ACTIVE" || loan.status === "PAID_OFF");
    return getTrendData(activeLoans, "createdAt", "loanAmount", loanTimeRange);
  }, [loanList, loanTimeRange]);

  // [REAL] Data Status Anggota (Ketua)
  const memberStatusChartData = useMemo(() => {
    const activeMembers = totalAnggota - inactiveMembers;
    return [
      { name: "Aktif", value: activeMembers > 0 ? activeMembers : 0 },
      { name: "Nonaktif", value: inactiveMembers },
    ];
  }, [totalAnggota, inactiveMembers]);
  
  const memberStatusChartColors = ["#14B8A6", "#9CA3AF"]; // teal, gray

  // [REAL & DUMMY] Data Tugas Admin (Sekretaris)
  const adminTaskData = useMemo(
    () => [
      { name: "Dokumen", value: documentBacklog.length }, // Masih dummy
      { name: "Surat Masuk", value: correspondenceQueue.length }, // Masih dummy
      { name: "Agenda", value: agendaList.length }, // REAL
    ],
    [agendaList] 
  );
  const adminTaskColors = ["#0EA5E9", "#F59E0B", "#8B5CF6"]; // sky, amber, violet

  // [REAL] Data Pertumbuhan Anggota (Ketua) - Dinamis
  const memberGrowthChartData = useMemo(() => {
    // valueKey 1 berarti kita hanya menghitung jumlah (count)
    return getTrendData(memberList, "createdAt", 1, memberTimeRange); 
  }, [memberList, memberTimeRange]);
  
  
  // --- Loading & Error State ---
  const skeletonFinance =
    boardPositions === null ? true : isTreasurer || !hasRoleAssignments;
  const skeletonManagement =
    boardPositions === null
      ? true
      : isChair || isSecretary || (!isTreasurer && !hasRoleAssignments);

  // Tampilkan Skeleton jika loading
  if (loading) {
    return (
      <DashboardSkeleton
        showMemberSections={skeletonManagement}
        showFinanceSections={skeletonFinance}
      />
    );
  }

  // Tampilkan Error jika fetch jabatan gagal
  if (boardPositionsStatus === "error" || boardPositionsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        <ServerCrash className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="font-semibold text-red-800 text-lg">
          Gagal Memuat Data Dashboard
        </p>
        <p className="mt-2">
          {boardPositionsError ??
            "Terjadi kesalahan saat mengambil data dari server. Pastikan backend berjalan dan coba muat ulang halaman."}
        </p>
      </div>
    );
  }

  // --- Render Functions ---

  const renderTreasurerSections = () => {
    const treasurerStats: StatCardProps[] = [
      {
        icon: PiggyBank,
        title: "Total Saldo Simpanan",
        value: totalSimpanan,
        color: "green",
        unit: "Rp",
      },
      {
        icon: HandCoins,
        title: "Pinjaman Aktif Beredar",
        value: outstandingLoanTotal,
        color: "blue",
        unit: "Rp",
      },
      {
        icon: AlertTriangle,
        title: "Nilai Pinjaman Menunggak",
        value: overdueLoansValue,
        color: "orange",
        unit: "Rp",
      },
    ];

    const financialHighlights = [
      {
        label: "Total Pinjaman (Lancar)",
        value: formatCurrency(onTimeLoansValue),
      },
      {
        label: "Total Pinjaman (Menunggak)",
        value: formatCurrency(overdueLoansValue),
      },
      {
        label: "Rata-rata Pinjaman Aktif",
        value: formatCurrency(averageLoanValue),
      },
      {
        label: "Arus Kas Simpanan (Net)",
        value: formatCurrency(netSimpananMovement),
      },
    ];

    return (
      <>
        {/* Baris 1: Statistik KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {treasurerStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Baris 2: Grafik Tren (BARU) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoListBox 
            title="Arus Kas Simpanan"
            controls={<TimeRangeToggle currentTimeRange={cashflowTimeRange} setTimeRange={setCashflowTimeRange} />}
          >
            <p className="text-sm text-gray-500 -mt-2 mb-4">
              Perbandingan total setoran dan penarikan yang tercatat.
            </p>
            {simpananCashflowChartData.reduce((sum, item) => sum + item.Setoran + item.Penarikan, 0) > 0 ? (
              <DashboardCashflowChart
                data={simpananCashflowChartData}
                colorSetoran="#22C55E"
                colorPenarikan="#F97316"
              />
            ) : (
              <p className="mt-4 text-sm text-gray-500 text-center pt-10">
                Belum ada data arus kas simpanan.
              </p>
            )}
          </InfoListBox>
          <InfoListBox 
            title="Pencairan Pinjaman Baru"
            controls={<TimeRangeToggle currentTimeRange={loanTimeRange} setTimeRange={setLoanTimeRange} />}
          >
             <p className="text-sm text-gray-500 -mt-2 mb-4">
              Total nilai pinjaman baru yang dicairkan per periode.
            </p>
            {loanDisbursalChartData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
              <DashboardGrowthChart
                data={loanDisbursalChartData}
                dataKey="value"
                unit="Rp"
                strokeColor="#0EA5E9"
                fillColor="#0EA5E9"
              />
            ) : (
              <p className="mt-4 text-sm text-gray-500 text-center pt-10">
                Belum ada data pencairan pinjaman.
              </p>
            )}
          </InfoListBox>
        </div>
        
        {/* Baris 3: Grafik Komposisi (Lama yg sudah disesuaikan) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <InfoListBox title="Komposisi Saldo Simpanan">
            <p className="text-sm text-gray-500 -mt-2 mb-4">
              Rincian total saldo simpanan berdasarkan jenisnya.
            </p>
            {simpananCompositionChartData.length > 0 ? (
              <DashboardPieChart
                data={simpananCompositionChartData}
                colors={simpananCompositionColors}
              />
            ) : (
              <p className="mt-4 text-sm text-gray-500 text-center pt-10">
                Belum ada data saldo simpanan.
              </p>
            )}
          </InfoListBox>
          <InfoListBox title="Status Portofolio Pinjaman (berdasarkan Nilai)">
             <p className="text-sm text-gray-500 -mt-2 mb-4">
              Rincian nilai pinjaman yang lancar vs. menunggak.
            </p>
            {loanPortfolioChartData.length > 0 ? (
              <DashboardPieChart
                data={loanPortfolioChartData}
                colors={loanPortfolioColors}
              />
            ) : (
              <p className="mt-4 text-sm text-gray-500 text-center pt-10">
                Belum ada data pinjaman aktif.
              </p>
            )}
          </InfoListBox>
        </div>

        {/* Baris 4: Daftar & Info Detail */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <InfoListBox title="Ikhtisar Kesehatan Keuangan" className="xl:col-span-2">
            <ul className="space-y-4">
              {financialHighlights.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-800 text-base">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </InfoListBox>

          <InfoListBox title="Pinjaman Jatuh Tempo (30 Hari)" viewMoreLink="/dashboard/admin/pinjaman-anggota">
            {upcomingDueLoans.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada pinjaman jatuh tempo.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 -mt-4">
                {upcomingDueLoans.map((loan) => (
                  <li key={loan.id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{loan.borrower}</p>
                      <p className="text-xs text-gray-500">
                        Jatuh tempo {loan.dueDate} • {formatCurrency(loan.amount)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                      {loan.daysLeft} hari
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>
        </div>
      </>
    );
  };

  // --- RENDER KETUA SECTION (REAL DATA) ---
  const renderChairSections = () => {
    const chairStats: StatCardProps[] = [
      {
        icon: Users,
        title: "Total Anggota Aktif",
        value: totalAnggota,
        color: "blue",
      },
      {
        icon: UserPlus,
        title: "Persetujuan Menunggu",
        value: pendaftarBaruCount,
        color: "green",
      },
      {
        icon: MessageSquare,
        title: "Total Saran Menunggu",
        value: totalSaranCount,
        color: "purple",
      },
    ];
    
    // Data untuk "Tugas Cepat" sesuai permintaan Anda
    const quickTasks = [
      {
        href: "/dashboard/admin/persetujuan-anggota",
        icon: UserPlus,
        title: "Persetujuan Anggota",
        count: pendaftarBaruCount,
        color: "green"
      },
      {
        href: "/dashboard/admin/saran-anggota",
        icon: MessageSquare,
        title: "Saran Anggota",
        count: saranAnggotaCount,
        color: "blue"
      },
      {
        href: "/dashboard/admin/saran-pengawas",
        icon: Briefcase,
        title: "Saran Pengawas",
        count: saranPengawasCount,
        color: "purple"
      }
    ];

    return (
      <>
        {/* Baris 1: Statistik KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chairStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Baris 2: Grafik Utama (Pertumbuhan) */}
        <InfoListBox 
          title="Pertumbuhan Anggota"
          controls={<TimeRangeToggle currentTimeRange={memberTimeRange} setTimeRange={setMemberTimeRange} />}
        >
          <p className="text-sm text-gray-500 -mt-2 mb-4">
            Jumlah anggota baru yang bergabung per periode.
          </p>
          {memberGrowthChartData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
            <DashboardGrowthChart
              data={memberGrowthChartData}
              dataKey="value"
              unit="anggota"
              strokeColor="#14B8A6" // Teal
              fillColor="#14B8A6" // Teal
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-gray-500">
                Belum ada data pertumbuhan anggota.
              </p>
            </div>
          )}
        </InfoListBox>
        
        {/* Baris 3: Tugas Cepat & Daftar Penting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoListBox title="Tugas Cepat">
            <div className="space-y-3">
              {quickTasks.map(task => (
                <QuickTaskCard key={task.href} {...task} />
              ))}
            </div>
          </InfoListBox>
          
          <InfoListBox title="Agenda Ekspedisi Terdekat" viewMoreLink="/dashboard/admin/agenda-ekspedisi">
            {upcomingAgenda.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada agenda terdekat.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 -mt-4">
                {upcomingAgenda.map((agenda) => (
                  <li key={agenda.id} className="py-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{agenda.perihal}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(agenda.tanggal)} • {agenda.lokasi}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>
          
          <InfoListBox title="Buku Tamu Terbaru" viewMoreLink="/dashboard/admin/buku-tamu">
            {recentBukuTamu.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada tamu terbaru.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 -mt-4">
                {recentBukuTamu.map((tamu) => (
                  <li key={tamu.id} className="py-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{tamu.nama}</p>
                    <p className="text-xs text-gray-500">
                      {/* [FIX] Sesuaikan dengan tipe data BukuTamu */}
                      {formatDate(tamu.tanggal)} • {tamu.keperluan}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>
        </div>

        {/* Baris 4: Grafik Sekunder & Anggota Baru */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoListBox title="Komposisi Status Anggota">
            <p className="text-sm text-gray-500 -mt-2 mb-4">
              Perbandingan jumlah anggota aktif dan nonaktif.
            </p>
            {memberStatusChartData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
              <DashboardPieChart
                data={memberStatusChartData}
                colors={memberStatusChartColors}
              />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-gray-500">
                  Belum ada data anggota.
                </p>
              </div>
            )}
          </InfoListBox>
          
          <InfoListBox title="Anggota Bergabung Baru" viewMoreLink="/dashboard/admin/daftar-anggota">
            {anggotaTerbaruList.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada anggota baru.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 -mt-4 max-h-80 overflow-y-auto">
                {anggotaTerbaruList.map((anggota, index) => (
                  <li key={index} className="py-3 flex items-center space-x-4">
                    <div className="shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                        {anggota.nama.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {anggota.nama}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Bergabung {anggota.tanggalMasuk}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>
        </div>
      </>
    );
  };

  const renderSecretarySections = () => {
    const secretaryStats: StatCardProps[] = [
      {
        icon: FileText,
        title: "Dokumen Menunggu",
        value: documentBacklog.length, // Masih dummy
        color: "blue",
      },
      {
        icon: Mail,
        title: "Surat Baru",
        value: correspondenceQueue.length, // Masih dummy
        color: "green",
      },
      {
        icon: Library,
        title: "Agenda Terdekat",
        value: agendaList.length, // REAL
        color: "red",
      },
    ];

    return (
      <>
        {/* Baris 1: Statistik KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secretaryStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
        
        {/* Baris 2: Grafik & Aktivitas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoListBox title="Ringkasan Tugas Administratif">
            <p className="text-sm text-gray-500 -mt-2 mb-4">
              Visualisasi jumlah tugas administratif yang perlu ditangani.
            </p>
            {adminTaskData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
              <DashboardPieChart
                data={adminTaskData}
                colors={adminTaskColors}
              />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-gray-500">
                  Tidak ada tugas administratif.
                </p>
              </div>
            )}
          </InfoListBox>
          
          <InfoListBox title="Aktivitas Terbaru" className="lg:col-span-2">
            {aktivitasTerbaruList.length === 0 ? (
               <p className="text-sm text-gray-500 text-center pt-10">
                Belum ada aktivitas terbaru.
              </p>
            ) : (
              <ul className="space-y-4 -mt-4">
                {aktivitasTerbaruList.map((aktivitas, index) => {
                  const Icon = aktivitas.ikon;
                  return (
                    <li key={index} className="flex items-start gap-3 pt-4 border-t border-gray-100 first:border-t-0 first:pt-0">
                      <div className="p-2 bg-gray-100 rounded-full mt-1">
                        <Icon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{aktivitas.teks}</p>
                        <p className="text-xs text-gray-400">{aktivitas.waktu}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoListBox>
        </div>

        {/* Baris 3: Daftar Tugas Sekretaris */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoListBox title="Agenda & Ekspedisi" viewMoreLink="/dashboard/admin/agenda-ekspedisi">
            {upcomingAgenda.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada agenda terdekat.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 -mt-4">
                {upcomingAgenda.map((agenda) => (
                  <li key={agenda.id} className="py-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{agenda.perihal}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(agenda.tanggal)} • {agenda.lokasi}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>

          <InfoListBox title="Dokumen Prioritas" viewMoreLink="/dashboard/admin/notulen-rapat-anggota">
            {documentBacklog.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada dokumen menunggu.
              </p>
            ) : (
              <ul className="space-y-3 -mt-4">
                {documentBacklog.map((doc, index) => ( // Tambah index key
                  <li
                    key={index}
                    className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                  >
                    <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                    <p className="text-xs text-gray-500 mb-2">PIC: {doc.owner}</p>
                    <span className="inline-block text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>
          
          <InfoListBox title="Surat Masuk Terbaru" viewMoreLink="/dashboard/admin/agenda-ekspedisi">
             {correspondenceQueue.length === 0 ? (
              <p className="text-sm text-gray-500 text-center pt-10">
                Tidak ada surat masuk.
              </p>
            ) : (
              <ul className="space-y-3 -mt-4">
                {correspondenceQueue.map((mailItem, index) => ( // Tambah index key
                  <li
                    key={index}
                    className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                  >
                    <p className="font-semibold text-gray-800 text-sm">{mailItem.subject}</p>
                    <p className="text-xs text-gray-500">
                      Dari {mailItem.sender} • {mailItem.receivedAt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </InfoListBox>
        </div>
      </>
    );
  };

  const renderDefaultSections = () => {
    // Tampilan default kini mirip dengan Ketua, tapi lebih simpel
    const defaultStats: StatCardProps[] = [
      {
        icon: Users,
        title: "Total Anggota",
        value: totalAnggota,
        color: "blue",
      },
      {
        icon: PiggyBank,
        title: "Total Simpanan",
        value: totalSimpanan,
        color: "green",
        unit: "Rp",
      },
      {
        icon: HandCoins,
        title: "Pinjaman Beredar",
        value: totalPinjamanBeredar,
        color: "red",
        unit: "Rp",
      },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoListBox title="Tugas & Notifikasi" className="lg:col-span-1">
             <div className="space-y-3">
              <QuickTaskCard 
                href="/dashboard/admin/persetujuan-anggota"
                icon={UserPlus}
                title="Persetujuan Anggota"
                count={pendaftarBaruCount}
                color="green"
              />
              <QuickTaskCard 
                href="/dashboard/admin/saran-anggota"
                icon={MessageSquare}
                title="Saran Anggota"
                count={saranAnggotaCount}
                color="blue"
              />
            </div>
          </InfoListBox>
          
          <InfoListBox title="Aktivitas Terbaru" className="lg:col-span-2">
            {aktivitasTerbaruList.length === 0 ? (
               <p className="text-sm text-gray-500 text-center pt-10">
                Belum ada aktivitas terbaru.
              </p>
            ) : (
              <ul className="space-y-4 -mt-4">
                {aktivitasTerbaruList.map((aktivitas, index) => {
                  const Icon = aktivitas.ikon;
                  return (
                    <li key={index} className="flex items-start gap-3 pt-4 border-t border-gray-100 first:border-t-0 first:pt-0">
                      <div className="p-2 bg-gray-100 rounded-full mt-1">
                        <Icon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{aktivitas.teks}</p>
                        <p className="text-xs text-gray-400">{aktivitas.waktu}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoListBox>
        </div>
      </>
    );
  };

  const renderRoleSections = () => {
    if (isTreasurer) {
      return renderTreasurerSections();
    }
    if (isChair) {
      return renderChairSections();
    }
    if (isSecretary) {
      return renderSecretarySections();
    }
    // Jika tidak ada role spesifik, tampilkan gabungan yg paling relevan
    return renderChairSections(); 
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard {namaKoperasi}
        </h1>
        <p className="mt-2 text-gray-600">
          Selamat datang kembali! Berikut ringkasan operasional koperasi Anda.
        </p>
      </div>

      {renderRoleSections()}
    </div>
  );
}