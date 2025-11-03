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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, ElementType } from "react";
import clsx from "clsx";

import {
  simpananApi,
  loanApi,
  memberApi,
  type Loan,
  type SimpananTransaksi,
  type Member,
} from "@/lib/apiService";
import { adminService } from "@/services/admin.service";

const formatCurrency = (value: number) => {
  const absolute = Math.abs(value);
  const formatted = absolute.toLocaleString("id-ID");
  return `${value < 0 ? "-" : ""}Rp ${formatted}`;
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

type DashboardData = {
  namaKoperasi: string;
  stats: {
    totalAnggota: { value: number; change: number };
    totalSimpanan: { value: number; change: number };
    totalPinjaman: { value: number; change: number };
  };
  tugas: {
    pendaftarBaru: number;
    saranBaru: number;
  };
  anggotaTerbaru: { nama: string; tanggalMasuk: string }[];
  aktivitasTerbaru: { ikon: ElementType; teks: string; waktu: string }[];
};

type StatCardProps = {
  icon: ElementType;
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  color: string;
  unit?: string;
};

const StatCard = ({
  icon,
  title,
  value,
  change,
  changeLabel,
  color,
  unit = "",
}: StatCardProps) => {
  const IconComponent = icon;
  const hasChange = typeof change === "number";
  const isPositive = hasChange ? (change as number) >= 0 : true;
  const changeValue = change ?? 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <IconComponent className={`h-7 w-7 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {unit}
            {value.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      {hasChange && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          <span
            className={clsx(
              "flex items-center font-semibold",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            <ArrowUpRight
              size={16}
              className={clsx({ "transform rotate-180": !isPositive })}
            />
            {Math.abs(changeValue)}%
          </span>
          <span className="text-gray-500">
            {changeLabel ?? "vs bulan lalu"}
          </span>
        </div>
      )}
    </div>
  );
};

type ActionCardTheme = {
  wrapper: string;
  iconWrapper: string;
  icon: string;
};

type ActionCardProps = {
  href: string;
  icon: ElementType;
  title: string;
  description: string;
  theme?: ActionCardTheme;
};

const ActionCard = ({
  href,
  icon,
  title,
  description,
  theme,
}: ActionCardProps) => {
  const Icon = icon;
  const appliedTheme =
    theme ??
    ({
      wrapper: "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md",
      iconWrapper: "bg-gray-100",
      icon: "text-gray-600",
    } satisfies ActionCardTheme);

  return (
    <Link
      href={href}
      className={clsx(
        "p-5 rounded-xl border shadow-sm transition-all flex items-center gap-4",
        appliedTheme.wrapper
      )}
    >
      <div className={clsx("p-3 rounded-full", appliedTheme.iconWrapper)}>
        <Icon className={clsx("h-6 w-6", appliedTheme.icon)} />
      </div>
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
};

const ROLE_ACTION_CARDS: Record<string, ActionCardProps[]> = {
  bendahara: [
    {
      href: "/dashboard/admin/simpanan-anggota",
      icon: Landmark,
      title: "Kelola Simpanan",
      description: "Pantau dan catat transaksi simpanan",
      theme: {
        wrapper:
          "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:shadow-md",
        iconWrapper: "bg-emerald-100",
        icon: "text-emerald-600",
      },
    },
    {
      href: "/dashboard/admin/pinjaman-anggota",
      icon: HandCoins,
      title: "Kelola Pinjaman",
      description: "Review dan salurkan pinjaman anggota",
      theme: {
        wrapper: "bg-rose-50 border-rose-200 hover:bg-rose-100 hover:shadow-md",
        iconWrapper: "bg-rose-100",
        icon: "text-rose-600",
      },
    },
    {
      href: "/dashboard/admin/daftar-inventaris",
      icon: Archive,
      title: "Inventaris Koperasi",
      description: "Monitor aset dan perlengkapan koperasi",
      theme: {
        wrapper:
          "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:shadow-md",
        iconWrapper: "bg-amber-100",
        icon: "text-amber-600",
      },
    },
    {
      href: "/dashboard/admin/website/katalog",
      icon: BookMarked,
      title: "Katalog Produk",
      description: "Perbarui etalase produk koperasi",
      theme: {
        wrapper:
          "bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100 hover:shadow-md",
        iconWrapper: "bg-fuchsia-100",
        icon: "text-fuchsia-600",
      },
    },
  ],
  ketua: [
    {
      href: "/dashboard/admin/persetujuan-anggota",
      icon: UserPlus,
      title: "Persetujuan Anggota",
      description: "Tinjau pengajuan anggota baru",
      theme: {
        wrapper:
          "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:shadow-md",
        iconWrapper: "bg-amber-100",
        icon: "text-amber-700",
      },
    },
    {
      href: "/dashboard/admin/daftar-pengurus",
      icon: BookUser,
      title: "Daftar Pengurus",
      description: "Kelola struktur kepengurusan aktif",
      theme: {
        wrapper:
          "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:shadow-md",
        iconWrapper: "bg-sky-100",
        icon: "text-sky-600",
      },
    },
    {
      href: "/dashboard/admin/saran-pengawas",
      icon: MessageSquare,
      title: "Saran Pengawas",
      description: "Tindak lanjuti masukan dari pengawas",
      theme: {
        wrapper:
          "bg-violet-50 border-violet-200 hover:bg-violet-100 hover:shadow-md",
        iconWrapper: "bg-violet-100",
        icon: "text-violet-600",
      },
    },
    {
      href: "/dashboard/admin/agenda-ekspedisi",
      icon: Mail,
      title: "Agenda & Ekspedisi",
      description: "Atur disposisi surat dan jadwal kegiatan",
      theme: {
        wrapper:
          "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:shadow-md",
        iconWrapper: "bg-cyan-100",
        icon: "text-cyan-600",
      },
    },
    {
      href: "/dashboard/admin/sistem/log-audit",
      icon: FileText,
      title: "Log Aktivitas",
      description: "Pantau histori aktivitas sistem",
      theme: {
        wrapper:
          "bg-stone-50 border-stone-200 hover:bg-stone-100 hover:shadow-md",
        iconWrapper: "bg-stone-100",
        icon: "text-stone-600",
      },
    },
  ],
  sekretaris: [
    {
      href: "/dashboard/admin/buku-tamu",
      icon: BookOpen,
      title: "Buku Tamu",
      description: "Catat tamu dan keperluan kunjungan",
      theme: {
        wrapper:
          "bg-teal-50 border-teal-200 hover:bg-teal-100 hover:shadow-md",
        iconWrapper: "bg-teal-100",
        icon: "text-teal-600",
      },
    },
    {
      href: "/dashboard/admin/notulen-rapat-anggota",
      icon: FileText,
      title: "Notulen Rapat",
      description: "Dokumentasikan keputusan rapat",
      theme: {
        wrapper:
          "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:shadow-md",
        iconWrapper: "bg-indigo-100",
        icon: "text-indigo-600",
      },
    },
    {
      href: "/dashboard/admin/catatan-kejadian",
      icon: ClipboardList,
      title: "Catatan Kejadian",
      description: "Rekam insiden dan tindak lanjut",
      theme: {
        wrapper:
          "bg-rose-50 border-rose-200 hover:bg-rose-100 hover:shadow-md",
        iconWrapper: "bg-rose-100",
        icon: "text-rose-600",
      },
    },
    {
      href: "/dashboard/admin/agenda-ekspedisi",
      icon: Mail,
      title: "Agenda & Ekspedisi",
      description: "Kelola surat masuk & keluar",
      theme: {
        wrapper:
          "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:shadow-md",
        iconWrapper: "bg-cyan-100",
        icon: "text-cyan-600",
      },
    },
  ],
};

const DEFAULT_ACTION_CARDS: ActionCardProps[] = [
  {
    href: "/dashboard/admin/simpanan-anggota",
    icon: Landmark,
    title: "Catat Simpanan",
    description: "Input setoran & penarikan",
    theme: {
      wrapper:
        "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:shadow-md",
      iconWrapper: "bg-emerald-100",
      icon: "text-emerald-600",
    },
  },
  {
    href: "/dashboard/admin/pinjaman-anggota",
    icon: HandCoins,
    title: "Catat Pinjaman",
    description: "Buat pengajuan pinjaman baru",
    theme: {
      wrapper: "bg-rose-50 border-rose-200 hover:bg-rose-100 hover:shadow-md",
      iconWrapper: "bg-rose-100",
      icon: "text-rose-600",
    },
  },
  {
    href: "/dashboard/admin/daftar-anggota",
    icon: UserPlus,
    title: "Tambah Anggota",
    description: "Daftarkan anggota baru",
    theme: {
      wrapper: "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:shadow-md",
      iconWrapper: "bg-sky-100",
      icon: "text-sky-600",
    },
  },
  {
    href: "/dashboard/admin/pinjaman-anggota",
    icon: Send,
    title: "Kirim Notifikasi",
    description: "Info jatuh tempo pinjaman",
    theme: {
      wrapper:
        "bg-violet-50 border-violet-200 hover:bg-violet-100 hover:shadow-md",
      iconWrapper: "bg-violet-100",
      icon: "text-violet-600",
    },
  },
];

const createDashboardData = (
  membersCount: number,
  totalSimpanan: number,
  totalPinjaman: number
): DashboardData => ({
  namaKoperasi: "Koperasi Merah Putih",
  stats: {
    totalAnggota: { value: membersCount, change: 5 },
    totalSimpanan: { value: totalSimpanan, change: 12 },
    totalPinjaman: { value: totalPinjaman, change: -3 },
  },
  tugas: {
    pendaftarBaru: 3,
    saranBaru: 5,
  },
  anggotaTerbaru: [
    { nama: "Siti Lestari", tanggalMasuk: "14 Sep 2025" },
    { nama: "Agus Purnomo", tanggalMasuk: "11 Sep 2025" },
    { nama: "Rina Wulandari", tanggalMasuk: "08 Sep 2025" },
  ],
  aktivitasTerbaru: [
    {
      ikon: HandCoins,
      teks: "Pinjaman baru untuk Budi Santoso telah dicatat.",
      waktu: "2 jam lalu",
    },
    {
      ikon: Landmark,
      teks: "Setoran sukarela dari Alviansyah Burhani diterima.",
      waktu: "Kemarin",
    },
    {
      ikon: BookUser,
      teks: "Andi Wijaya diangkat sebagai Ketua Pengurus.",
      waktu: "3 hari lalu",
    },
  ],
});

const DashboardSkeleton = ({
  actionCount,
  showMemberSections,
  showFinanceSections,
  showActivitySections,
}: {
  actionCount: number;
  showMemberSections: boolean;
  showFinanceSections: boolean;
  showActivitySections: boolean;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
        {Array.from({ length: Math.max(actionCount, 4) }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4"
          >
            <div className="p-3 rounded-full bg-gray-100">
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div>
              <div className="h-5 w-3/4 mb-2 rounded-md bg-gray-200 animate-pulse" />
              <div className="h-4 w-full rounded-md bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div
        className={clsx(
          "grid grid-cols-1 gap-6 mt-6",
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

      {showActivitySections && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="h-6 w-40 mb-4 rounded-md bg-gray-200 animate-pulse" />
              <div className="space-y-3">
                {[...Array(2)].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-4 w-40 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="h-6 w-8 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="h-6 w-48 mb-4 rounded-md bg-gray-200 animate-pulse" />
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-64 rounded-md bg-gray-200 animate-pulse" />
                      <div className="h-3 w-24 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <div className="h-6 w-56 mb-4 rounded-md bg-gray-200 animate-pulse" />
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded-md bg-gray-200 animate-pulse" />
                    <div className="h-3 w-32 rounded-md bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardPositions, setBoardPositions] = useState<string[] | null>(null);
  const [loanList, setLoanList] = useState<Loan[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [simpananTransactionsList, setSimpananTransactionsList] = useState<
    SimpananTransaksi[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    const loadBoardPositions = async () => {
      try {
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
      } catch (error) {
        console.warn("Gagal mengambil jabatan pengurus aktif:", error);
        if (isMounted) {
          setBoardPositions([]);
        }
      }
    };

    loadBoardPositions().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (boardPositions === null) {
      return;
    }

    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);

      const normalized = boardPositions
        .map((pos) => pos.toLowerCase())
        .filter(Boolean);
      const canAccessFinance = normalized.includes("bendahara");

      try {
        const [simpananData, loanData, memberData] = await Promise.all([
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
          memberApi.getAllMembers().catch((error) => {
            console.warn("Data anggota tidak dapat diakses:", error);
            return [] as Member[];
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setSimpananTransactionsList(simpananData);
        setLoanList(loanData);
        setMemberList(memberData);

        let totalSimpanan = 0;
        simpananData.forEach((trx) => {
          const sign = trx.tipe === "SETORAN" ? 1 : -1;
          totalSimpanan += sign * trx.jumlah;
        });

        const totalPinjamanBeredar = loanData
          .filter((loan) => loan.status !== "PAID_OFF")
          .reduce((sum, loan) => sum + loan.loanAmount, 0);

        setData(
          createDashboardData(memberData.length, totalSimpanan, totalPinjamanBeredar)
        );
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        if (isMounted) {
          setSimpananTransactionsList([]);
          setLoanList([]);
          setMemberList([]);
          setData(createDashboardData(152, 850_750_000, 215_500_000));
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
  }, [boardPositions]);

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

  const actionCards = useMemo(() => {
    if (!hasRoleAssignments) {
      return DEFAULT_ACTION_CARDS;
    }

    const map = new Map<string, ActionCardProps>();
    normalizedPositions.forEach((jabatan) => {
      const cards = ROLE_ACTION_CARDS[jabatan] ?? [];
      cards.forEach((card) => {
        if (!map.has(card.href)) {
          map.set(card.href, card);
        }
      });
    });

    return map.size > 0 ? Array.from(map.values()) : DEFAULT_ACTION_CARDS;
  }, [hasRoleAssignments, normalizedPositions]);

  const outstandingLoans = useMemo(
    () => loanList.filter((loan) => loan.status !== "PAID_OFF"),
    [loanList]
  );
  const outstandingLoanTotal = useMemo(
    () => outstandingLoans.reduce((sum, loan) => sum + loan.loanAmount, 0),
    [outstandingLoans]
  );
  const outstandingLoanCount = outstandingLoans.length;
  const overdueLoansCount = useMemo(() => {
    const now = new Date();
    return outstandingLoans.filter((loan) => {
      if (!loan.dueDate) return false;
      const due = new Date(loan.dueDate);
      if (Number.isNaN(due.getTime())) return false;
      return due < now;
    }).length;
  }, [outstandingLoans]);
  const averageLoanValue = outstandingLoanCount
    ? Math.round(outstandingLoanTotal / outstandingLoanCount)
    : 0;

  const upcomingDueLoans = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime());
    limit.setDate(limit.getDate() + 30);

    return outstandingLoans
      .filter((loan) => {
        if (!loan.dueDate) return false;
        const due = new Date(loan.dueDate);
        if (Number.isNaN(due.getTime())) return false;
        return due >= now && due <= limit;
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

  const totalDeposits = useMemo(
    () =>
      simpananTransactionsList
        .filter((trx) => trx.tipe === "SETORAN")
        .reduce((sum, trx) => sum + trx.jumlah, 0),
    [simpananTransactionsList]
  );
  const totalWithdrawals = useMemo(
    () =>
      simpananTransactionsList
        .filter((trx) => trx.tipe === "PENARIKAN")
        .reduce((sum, trx) => sum + trx.jumlah, 0),
    [simpananTransactionsList]
  );
  const netSimpananMovement = totalDeposits - totalWithdrawals;
  const transactionTotal = totalDeposits + totalWithdrawals;
  const depositShare = transactionTotal
    ? Math.round((totalDeposits / transactionTotal) * 100)
    : 0;
  const withdrawalShare = transactionTotal ? 100 - depositShare : 0;
  const inactiveMembers = useMemo(
    () =>
      memberList.filter(
        (member) => member.status && member.status !== "ACTIVE"
      ).length,
    [memberList]
  );

  const skeletonFinance =
    boardPositions === null ? true : isTreasurer || !hasRoleAssignments;
  const skeletonManagement =
    boardPositions === null
      ? true
      : isChair || isSecretary || (!isTreasurer && !hasRoleAssignments);
  const skeletonActivity = skeletonManagement;

  if (loading || !data) {
    return (
      <DashboardSkeleton
        actionCount={actionCards.length}
        showMemberSections={skeletonManagement}
        showFinanceSections={skeletonFinance}
        showActivitySections={skeletonActivity}
      />
    );
  }

  const renderTreasurerSections = () => {
    const treasurerStats: StatCardProps[] = [
      {
        icon: PiggyBank,
        title: "Total Simpanan",
        value: data.stats.totalSimpanan.value,
        change: data.stats.totalSimpanan.change,
        color: "green",
        unit: "Rp ",
      },
      {
        icon: HandCoins,
        title: "Total Pinjaman",
        value: data.stats.totalPinjaman.value,
        change: data.stats.totalPinjaman.change,
        color: "red",
        unit: "Rp ",
      },
      {
        icon: Send,
        title: "Pinjaman Aktif",
        value: outstandingLoanCount,
        color: "blue",
      },
    ];

    const financialHighlights = [
      {
        label: "Portofolio pinjaman aktif",
        value: formatCurrency(outstandingLoanTotal),
      },
      {
        label: "Pinjaman overdue",
        value: `${overdueLoansCount} pinjaman`,
      },
      {
        label: "Rata-rata pinjaman",
        value: formatCurrency(averageLoanValue),
      },
      {
        label: "Simpanan bersih bulan ini",
        value: formatCurrency(netSimpananMovement),
      },
    ];

    return (
      <>
        <div
          className={clsx(
            "grid grid-cols-1 gap-6",
            treasurerStats.length >= 2 && "md:grid-cols-2",
            treasurerStats.length >= 3 && "lg:grid-cols-3"
          )}
        >
          {treasurerStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Ikhtisar Kesehatan Keuangan</h3>
            <p className="text-sm text-gray-500 mt-1">
              Pantau kesehatan portofolio pinjaman dan arus kas koperasi secara
              ringkas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {financialHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">
              Pinjaman Jatuh Tempo 30 Hari
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Prioritaskan pengingat dan tindak lanjut koleksi sebelum jatuh tempo.
            </p>
            {upcomingDueLoans.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Semua pinjaman aktif masih dalam jadwal pembayaran.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {upcomingDueLoans.map((loan) => (
                  <li key={loan.id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{loan.borrower}</p>
                      <p className="text-sm text-gray-500">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Ringkasan Simpanan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs uppercase text-emerald-700">Setoran</p>
                <p className="mt-2 text-lg font-semibold text-emerald-900">
                  {formatCurrency(totalDeposits)}
                </p>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
                <p className="text-xs uppercase text-rose-700">Penarikan</p>
                <p className="mt-2 text-lg font-semibold text-rose-900">
                  {formatCurrency(totalWithdrawals)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-600">Saldo Bersih</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(netSimpananMovement)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700">
                Komposisi transaksi bulan ini
              </p>
              <div className="mt-2 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${depositShare}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Setoran {depositShare}%</span>
                <span>Penarikan {withdrawalShare}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Aktivitas Terbaru</h3>
            <ul className="mt-4 space-y-4">
              {data.aktivitasTerbaru.map((aktivitas, index) => {
                const Icon = aktivitas.ikon;
                return (
                  <li key={index} className="flex items-start gap-3">
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
          </div>
        </div>
      </>
    );
  };

  const renderChairSections = () => {
    const chairStats: StatCardProps[] = [
      {
        icon: Users,
        title: "Total Anggota Aktif",
        value: data.stats.totalAnggota.value,
        change: data.stats.totalAnggota.change,
        color: "blue",
      },
      {
        icon: UserPlus,
        title: "Persetujuan Menunggu",
        value: data.tugas.pendaftarBaru,
        color: "green",
      },
      {
        icon: MessageSquare,
        title: "Saran Baru",
        value: data.tugas.saranBaru,
        color: "red",
      },
    ];

    const leadershipPulse = [
      {
        label: "Pinjaman jatuh tempo 30 hari",
        value: `${upcomingDueLoans.length} pinjaman`,
      },
      {
        label: "Pinjaman overdue",
        value: `${overdueLoansCount} pinjaman`,
      },
      {
        label: "Anggota nonaktif",
        value: `${inactiveMembers} orang`,
      },
      {
        label: "Simpanan bersih bulan ini",
        value: formatCurrency(netSimpananMovement),
      },
    ];

    const leadershipAgenda = [
      {
        title: "Rapat Pengurus Bulanan",
        date: "Senin, 15 Sep 2025",
        status: "Terjadwal",
      },
      {
        title: "Evaluasi Program Kredit Mikro",
        date: "Kamis, 18 Sep 2025",
        status: "Perlu konfirmasi",
      },
      {
        title: "Monitoring Kinerja Unit Usaha",
        date: "Senin, 22 Sep 2025",
        status: "Dalam persiapan",
      },
    ];

    return (
      <>
        <div
          className={clsx(
            "grid grid-cols-1 gap-6",
            chairStats.length >= 2 && "md:grid-cols-2",
            chairStats.length >= 3 && "lg:grid-cols-3"
          )}
        >
          {chairStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Pulsa Kepemimpinan</h3>
            <p className="text-sm text-gray-500 mt-1">
              Ringkasan indikator utama yang perlu mendapat perhatian jajaran
              pengurus.
            </p>
            <ul className="mt-4 space-y-4">
              {leadershipPulse.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-800">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Pinjaman Jatuh Tempo</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gunakan informasi ini untuk menyusun strategi tindak lanjut bersama
              bendahara.
            </p>
            {upcomingDueLoans.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Tidak ada pinjaman prioritas dalam 30 hari ke depan.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcomingDueLoans.map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{loan.borrower}</p>
                      <p className="text-xs text-gray-500">
                        {loan.dueDate} • {formatCurrency(loan.amount)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      {loan.daysLeft} hari
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Aktivitas Terbaru</h3>
            <ul className="mt-4 space-y-4">
              {data.aktivitasTerbaru.map((aktivitas, index) => {
                const Icon = aktivitas.ikon;
                return (
                  <li key={index} className="flex items-start gap-3">
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
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Agenda Pengurus</h3>
            <ul className="mt-4 space-y-3">
              {leadershipAgenda.map((agenda) => (
                <li
                  key={agenda.title}
                  className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <p className="font-semibold text-gray-800">{agenda.title}</p>
                  <p className="text-sm text-gray-500">{agenda.date}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                    {agenda.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800">Anggota Bergabung Baru</h3>
          <div className="mt-4 flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {data.anggotaTerbaru.map((anggota, index) => (
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
          </div>
        </div>
      </>
    );
  };

  const renderSecretarySections = () => {
    const secretaryAgenda = [
      {
        title: "Persiapan RAT Tahunan",
        date: "Selasa, 16 Sep 2025",
        category: "Rapat",
      },
      {
        title: "Pengarsipan dokumen pinjaman Agustus",
        date: "Rabu, 17 Sep 2025",
        category: "Arsip",
      },
      {
        title: "Pengiriman laporan bulanan ke Pengawas",
        date: "Jumat, 19 Sep 2025",
        category: "Ekspedisi",
      },
    ];

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

    const secretaryStats: StatCardProps[] = [
      {
        icon: FileText,
        title: "Dokumen Menunggu",
        value: documentBacklog.length,
        color: "blue",
      },
      {
        icon: Mail,
        title: "Surat Baru",
        value: correspondenceQueue.length,
        color: "green",
      },
      {
        icon: BookOpen,
        title: "Agenda Minggu Ini",
        value: secretaryAgenda.length,
        color: "red",
      },
    ];

    return (
      <>
        <div
          className={clsx(
            "grid grid-cols-1 gap-6",
            secretaryStats.length >= 2 && "md:grid-cols-2",
            secretaryStats.length >= 3 && "lg:grid-cols-3"
          )}
        >
          {secretaryStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Agenda & Ekspedisi</h3>
            <ul className="mt-4 space-y-3">
              {secretaryAgenda.map((agenda) => (
                <li
                  key={agenda.title}
                  className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <p className="font-semibold text-gray-800">{agenda.title}</p>
                  <p className="text-sm text-gray-500">{agenda.date}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">
                    {agenda.category}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Dokumen Prioritas</h3>
            <ul className="mt-4 space-y-3">
              {documentBacklog.map((doc) => (
                <li
                  key={doc.title}
                  className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <p className="font-semibold text-gray-800">{doc.title}</p>
                  <p className="text-sm text-gray-500">PIC: {doc.owner}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                    {doc.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Surat Masuk Terbaru</h3>
            <ul className="mt-4 space-y-3">
              {correspondenceQueue.map((mailItem) => (
                <li
                  key={mailItem.subject}
                  className="rounded-lg border border-gray-100 p-4 bg-gray-50"
                >
                  <p className="font-semibold text-gray-800">{mailItem.subject}</p>
                  <p className="text-sm text-gray-500">
                    Dari {mailItem.sender} • {mailItem.receivedAt}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800">Aktivitas Terbaru</h3>
            <ul className="mt-4 space-y-4">
              {data.aktivitasTerbaru.map((aktivitas, index) => {
                const Icon = aktivitas.ikon;
                return (
                  <li key={index} className="flex items-start gap-3">
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
          </div>
        </div>
      </>
    );
  };

  const renderDefaultSections = () => {
    const defaultStats: StatCardProps[] = [
      {
        icon: Users,
        title: "Total Anggota",
        value: data.stats.totalAnggota.value,
        change: data.stats.totalAnggota.change,
        color: "blue",
      },
      {
        icon: PiggyBank,
        title: "Total Simpanan",
        value: data.stats.totalSimpanan.value,
        change: data.stats.totalSimpanan.change,
        color: "green",
        unit: "Rp ",
      },
      {
        icon: HandCoins,
        title: "Pinjaman Beredar",
        value: data.stats.totalPinjaman.value,
        change: data.stats.totalPinjaman.change,
        color: "red",
        unit: "Rp ",
      },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-700">Tugas & Notifikasi</h3>
              <div className="mt-4 space-y-3">
                <Link
                  href="/dashboard/admin/persetujuan-anggota"
                  className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-yellow-700" />
                    <span className="font-semibold text-yellow-800">
                      Persetujuan Anggota Baru
                    </span>
                  </div>
                  <span className="font-bold text-white bg-yellow-500 rounded-full px-2 py-0.5 text-sm">
                    {data.tugas.pendaftarBaru}
                  </span>
                </Link>
                <Link
                  href="/dashboard/admin/saran-anggota"
                  className="flex justify-between items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-700" />
                    <span className="font-semibold text-blue-800">
                      Saran Anggota Masuk
                    </span>
                  </div>
                  <span className="font-bold text-white bg-blue-500 rounded-full px-2 py-0.5 text-sm">
                    {data.tugas.saranBaru}
                  </span>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-700">Aktivitas Terbaru</h3>
              <ul className="mt-4 space-y-4">
                {data.aktivitasTerbaru.map((aktivitas, index) => {
                  const Icon = aktivitas.ikon;
                  return (
                    <li key={index} className="flex items-start gap-3">
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
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-700">Anggota Bergabung Baru</h3>
            <div className="mt-4 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {data.anggotaTerbaru.map((anggota, index) => (
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
            </div>
          </div>
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
    return renderDefaultSections();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard {data.namaKoperasi}
        </h1>
        <p className="mt-2 text-gray-600">
          Selamat datang kembali! Berikut ringkasan operasional koperasi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actionCards.map((card) => (
          <ActionCard key={card.href} {...card} />
        ))}
      </div>

      {renderRoleSections()}
    </div>
  );
}
