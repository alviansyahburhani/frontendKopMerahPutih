// Lokasi: frontend/app/(superadmin)/superadmin/page.tsx
"use client";

import { useState, useEffect, useMemo, memo } from "react";
import {
  CheckCircle, Clock, Slash, Building, ListChecks,
  ArrowRight // Untuk link
} from "lucide-react";
import Button from "@/components/Button";
import Link from "next/link";
import clsx from "clsx";

// --- Tipe Data Tenant (Sama) ---
type Tenant = {
  id: string;
  namaKoperasi: string;
  subdomain: string;
  namaPic: string;
  emailPic: string;
  teleponPic: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  tanggalDaftar: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  urlPengesahan?: string | null;
  urlDaftarUmum?: string | null;
  urlAkte?: string | null;
  urlNpwp?: string | null;
};

// --- Data Contoh (Sama) ---
const mockAllTenants: Tenant[] = [
  { id: "tenant-pending-001", namaKoperasi: "Koperasi Warga Sejahtera", subdomain: "wargasejahtera", namaPic: "Rina Pengelola", emailPic: "rina.p@example.com", teleponPic: "081234567890", provinsi: "Sulawesi Selatan", kota: "Kota Makassar", kecamatan: "Tamalanrea", kelurahan: "Tamalanrea Indah", tanggalDaftar: "2025-10-20T10:00:00Z", status: 'PENDING', urlPengesahan: "#", urlDaftarUmum: "#", urlAkte: null, urlNpwp: "#" },
  { id: "tenant-active-001", namaKoperasi: "Kopdes Maju Jaya", subdomain: "majujaya", namaPic: "Andi Wijaya", emailPic: "andi.w@example.com", teleponPic: "08111222333", provinsi: "Sulawesi Selatan", kota: "Kabupaten Gowa", kecamatan: "Somba Opu", kelurahan: "Sungguminasa", tanggalDaftar: "2025-09-15T08:00:00Z", status: 'ACTIVE', urlPengesahan: "#", urlDaftarUmum: "#", urlAkte: "#", urlNpwp: "#" },
  { id: "tenant-pending-002", namaKoperasi: "Kopdes Sumber Rejeki", subdomain: "sumberrejeki", namaPic: "Dewi Lestari", emailPic: "dewi.l@example.com", teleponPic: "085566778899", provinsi: "Sulawesi Selatan", kota: "Kabupaten Maros", kecamatan: "Turikale", kelurahan: "Pettuadae", tanggalDaftar: "2025-10-22T11:00:00Z", status: 'PENDING', urlPengesahan: null, urlDaftarUmum: "#", urlAkte: null, urlNpwp: null },
   { id: "tenant-suspended-001", namaKoperasi: "Koperasi Harapan Bangsa", subdomain: "harapanbangsa", namaPic: "Eko S.", emailPic: "eko.s@example.com", teleponPic: "089988776655", provinsi: "Sulawesi Selatan", kota: "Kota Parepare", kecamatan: "Ujung", kelurahan: "Labukkang", tanggalDaftar: "2025-07-01T09:00:00Z", status: 'SUSPENDED', urlPengesahan: "#", urlDaftarUmum: "#", urlAkte: "#", urlNpwp: "#" },
];

// --- Komponen Kartu Statistik yang Bisa Diklik ---
const StatCardLink = memo(({ icon, title, value, color, href }: {
    icon: React.ElementType,
    title: string,
    value: number | string,
    color: string,
    href: string // URL tujuan
}) => {
  const IconComponent = icon;
  return (
    <Link href={href} className="block group"> {/* Bungkus dengan Link */}
      <div className={clsx(
          "bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 ease-in-out",
          "group-hover:scale-[1.03] group-hover:shadow-xl group-hover:border-blue-200" // Efek hover
          )}>
        <div className="flex items-center gap-4">
          <div className={clsx(`p-3 rounded-full bg-${color}-100 transition-colors group-hover:bg-${color}-200`)}>
            <IconComponent className={clsx(`h-7 w-7 text-${color}-600`)} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
});
StatCardLink.displayName = "StatCardLink";

// --- Komponen Utama Dashboard ---
export default function SuperAdminDashboardPage() {
  const [tenantsData, setTenantsData] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setTenantsData(mockAllTenants);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const total = tenantsData.length;
    const active = tenantsData.filter(t => t.status === 'ACTIVE').length;
    const pending = tenantsData.filter(t => t.status === 'PENDING').length;
    const suspended = tenantsData.filter(t => t.status === 'SUSPENDED').length;
    // Ambil 3 pendaftar terbaru
    const recentPending = tenantsData
        .filter(t => t.status === 'PENDING')
        .sort((a, b) => new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime())
        .slice(0, 3);
    return { total, active, pending, suspended, recentPending };
  }, [tenantsData]);

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const SuperAdminDashboardSkeleton = () => (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-5 w-1/2 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="min-w-0">
                      <Skeleton className="h-4 w-64 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-64 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SuperAdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* --- BAGIAN HEADER --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Super Admin</h1>
        <p className="mt-2 text-gray-600">Selamat datang! Ringkasan platform sistemkoperasi.id.</p>
      </div>

      {/* --- KARTU STATISTIK TENANT (Clickable) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardLink icon={Building} title="Total Koperasi" value={stats.total} color="blue" href="/superadmin/tenants" />
        <StatCardLink icon={CheckCircle} title="Koperasi Aktif" value={stats.active} color="green" href="/superadmin/tenants?status=ACTIVE" />
        <StatCardLink icon={Clock} title="Menunggu Persetujuan" value={stats.pending} color="yellow" href="/superadmin/tenants?status=PENDING" />
        <StatCardLink icon={Slash} title="Koperasi Ditangguhkan" value={stats.suspended} color="red" href="/superadmin/tenants?status=SUSPENDED" />
      </div>

      {/* --- BAGIAN TUGAS & AKTIVITAS (Layout 2 Kolom) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Kolom Kiri: Tugas & Pendaftar Terbaru */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tugas Persetujuan */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
               <h3 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2"><ListChecks className="text-yellow-600"/> Tugas: Persetujuan Koperasi</h3>
               {stats.pending > 0 ? (
                 <>
                   <p className="text-gray-600 mb-4">
                     Ada <span className="font-bold text-xl text-yellow-700">{stats.pending}</span> koperasi baru menunggu persetujuan.
                   </p>
                   {/* Tampilkan Pendaftar Terbaru */}
                   <div className="space-y-3">
                        {stats.recentPending.map(tenant => (
                            <div key={tenant.id} className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <div>
                                    <p className="font-semibold text-yellow-800">{tenant.namaKoperasi}</p>
                                    <p className="text-xs text-yellow-700">{tenant.namaPic} - {new Date(tenant.tanggalDaftar).toLocaleDateString('id-ID')}</p>
                                </div>
                                <Link href={`/superadmin/tenants?search=${tenant.namaKoperasi}`}>
                                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                                        Proses <ArrowRight size={14}/>
                                    </Button>
                                </Link>
                            </div>
                        ))}
                   </div>
                   {stats.pending > stats.recentPending.length && (
                        <Link href="/superadmin/tenants?status=PENDING" className="block text-center mt-4">
                            <Button variant="outline" className="w-full border-yellow-500 text-yellow-700 hover:bg-yellow-50">
                                Lihat Semua ({stats.pending}) Pendaftar Pending
                            </Button>
                        </Link>
                   )}
                 </>
               ) : (
                 <p className="text-gray-500 mb-4">Tidak ada pendaftaran koperasi baru yang menunggu persetujuan. 👍</p>
               )}
            </div>

             {/* Kartu Aksi Cepat */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                 <h3 className="font-bold text-gray-700 text-lg mb-4">Aksi Cepat</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/superadmin/tenants">
                        <Button variant="outline" className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50">
                            Kelola Semua Koperasi
                        </Button>
                    </Link>
                     <Link href="/superadmin/berita">
                        <Button variant="outline" className="w-full justify-center border-gray-300 text-gray-700 hover:bg-gray-100">
                            Manajemen Berita Global
                        </Button>
                    </Link>
                     <Link href="/superadmin/galeri">
                        <Button variant="outline" className="w-full justify-center border-gray-300 text-gray-700 hover:bg-gray-100">
                            Manajemen Galeri Global
                        </Button>
                    </Link>
                     <Link href="/superadmin/settings">
                        <Button variant="outline" className="w-full justify-center border-gray-300 text-gray-700 hover:bg-gray-100">
                            Pengaturan Platform
                        </Button>
                    </Link>
                 </div>
            </div>

          </div>

          {/* Kolom Kanan: Aktivitas Platform */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
             <h3 className="font-bold text-gray-700 text-lg mb-4">Aktivitas Platform Terbaru</h3>
             <ul className="space-y-4 text-sm text-gray-600 max-h-[400px] overflow-y-auto pr-2"> {/* Tambahkan scroll jika perlu */}
                <li>
                    <p className="mb-0.5"><span className="font-semibold text-green-600">DISETUJUI:</span> Koperasi Maju Jaya</p>
                    <p className="text-xs text-gray-400">oleh Super Admin - {new Date("2025-10-22T09:00:00Z").toLocaleString('id-ID')}</p>
                </li>
                 <li>
                    <p className="mb-0.5"><span className="font-semibold text-blue-600">PENDAFTARAN:</span> Kopdes Sumber Rejeki</p>
                    <p className="text-xs text-gray-400">oleh Dewi Lestari - {new Date("2025-10-22T11:00:00Z").toLocaleString('id-ID')}</p>
                </li>
                 <li>
                    <p className="mb-0.5"><span className="font-semibold text-blue-600">PENDAFTARAN:</span> Koperasi Warga Sejahtera</p>
                    <p className="text-xs text-gray-400">oleh Rina Pengelola - {new Date("2025-10-20T10:00:00Z").toLocaleString('id-ID')}</p>
                </li>
                <li>
                    <p className="mb-0.5"><span className="font-semibold text-red-600">DITANGGUHKAN:</span> Koperasi Harapan Bangsa</p>
                    <p className="text-xs text-gray-400">oleh Super Admin - {new Date("2025-10-19T15:30:00Z").toLocaleString('id-ID')}</p>
                </li>
                 {/* ... tambahkan aktivitas lain */}
             </ul>
             {/* Tambahkan link ke halaman log aktivitas jika ada */}
             {/* <Link href="/superadmin/logs" className="block text-center mt-4 text-sm text-blue-600 hover:underline">Lihat Semua Aktivitas</Link> */}
          </div>
      </div>
    </div>
  );
}
