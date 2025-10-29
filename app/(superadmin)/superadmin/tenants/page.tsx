// Lokasi: frontend/app/(superadmin)/superadmin/tenants/page.tsx
"use client";

import { useState, useMemo, useEffect, useDeferredValue, useCallback, memo } from "react"; // Tambahkan useEffect
import {
  Building, Search, X, CheckCircle, Clock, Slash, MoreVertical,
  Eye, // Ikon untuk lihat detail
  FileText, // Ikon untuk dokumen
  XCircle // Ikon untuk tombol close modal
} from "lucide-react";
import Button from "@/components/Button";
import clsx from "clsx";

// --- Tipe Data Tenant Diperbarui (sesuaikan dengan data pendaftaran) ---
type Tenant = {
  id: string;
  namaKoperasi: string;
  subdomain: string;
  namaPic: string;
  emailPic: string;
  teleponPic: string; // <-- Ditambahkan
  provinsi: string; // <-- Ditambahkan
  kota: string; // <-- Ditambahkan
  kecamatan: string; // <-- Ditambahkan
  kelurahan: string; // <-- Ditambahkan
  tanggalDaftar: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  // URL Dokumen (sesuaikan nama field jika berbeda)
  urlPengesahan?: string | null;
  urlDaftarUmum?: string | null;
  urlAkte?: string | null; 
  urlNpwp?: string | null; 
};

// --- Data Contoh Diperbarui ---
const mockAllTenants: Tenant[] = [
  {
    id: "tenant-pending-001", namaKoperasi: "Koperasi Warga Sejahtera", subdomain: "wargasejahtera",
    namaPic: "Rina Pengelola", emailPic: "rina.p@example.com", teleponPic: "081234567890",
    provinsi: "Sulawesi Selatan", kota: "Kota Makassar", kecamatan: "Tamalanrea", kelurahan: "Tamalanrea Indah",
    tanggalDaftar: "2025-10-20T10:00:00Z", status: 'PENDING',
    urlPengesahan: "#", urlDaftarUmum: "#", urlAkte: null, urlNpwp: "#"
  },
  {
    id: "tenant-active-001", namaKoperasi: "Kopdes Maju Jaya", subdomain: "majujaya",
    namaPic: "Andi Wijaya", emailPic: "andi.w@example.com", teleponPic: "08111222333",
    provinsi: "Sulawesi Selatan", kota: "Kabupaten Gowa", kecamatan: "Somba Opu", kelurahan: "Sungguminasa",
    tanggalDaftar: "2025-09-15T08:00:00Z", status: 'ACTIVE',
    urlPengesahan: "#", urlDaftarUmum: "#", urlAkte: "#", urlNpwp: "#"
  },
  {
    id: "tenant-pending-002", namaKoperasi: "Kopdes Sumber Rejeki", subdomain: "sumberrejeki",
    namaPic: "Dewi Lestari", emailPic: "dewi.l@example.com", teleponPic: "085566778899",
    provinsi: "Sulawesi Selatan", kota: "Kabupaten Maros", kecamatan: "Turikale", kelurahan: "Pettuadae",
    tanggalDaftar: "2025-10-22T11:00:00Z", status: 'PENDING',
    urlPengesahan: null, urlDaftarUmum: "#", urlAkte: null, urlNpwp: null
   },
   {
    id: "tenant-suspended-001", namaKoperasi: "Koperasi Harapan Bangsa", subdomain: "harapanbangsa",
    namaPic: "Eko S.", emailPic: "eko.s@example.com", teleponPic: "089988776655",
    provinsi: "Sulawesi Selatan", kota: "Kota Parepare", kecamatan: "Ujung", kelurahan: "Labukkang",
    tanggalDaftar: "2025-07-01T09:00:00Z", status: 'SUSPENDED',
    urlPengesahan: "#", urlDaftarUmum: "#", urlAkte: "#", urlNpwp: "#"
   },
];

// --- Komponen Modal Detail Koperasi (Diadaptasi) ---
const DetailKoperasiModal = memo(({ koperasi, onClose }: { koperasi: Tenant | null; onClose: () => void; }) => {
  if (!koperasi) return null;

  const infoKoperasi = [
    { label: "Nama Koperasi", value: koperasi.namaKoperasi },
    { label: "Subdomain", value: koperasi.subdomain },
    { label: "Status", value: koperasi.status },
    { label: "Tanggal Daftar", value: new Date(koperasi.tanggalDaftar).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'}) },
  ];
  const infoLokasi = [
    { label: "Provinsi", value: koperasi.provinsi },
    { label: "Kabupaten/Kota", value: koperasi.kota },
    { label: "Kecamatan", value: koperasi.kecamatan },
    { label: "Desa/Kelurahan", value: koperasi.kelurahan },
  ];
   const infoPIC = [
    { label: "Nama PIC", value: koperasi.namaPic },
    { label: "Email PIC", value: koperasi.emailPic },
    { label: "Telepon PIC", value: koperasi.teleponPic },
  ];
  const dokumen = [
    { label: "Pengesahan Badan Hukum", url: koperasi.urlPengesahan },
    { label: "Daftar Umum Koperasi", url: koperasi.urlDaftarUmum },
    { label: "Akte Notaris Pendirian", url: koperasi.urlAkte },
    { label: "NPWP Koperasi", url: koperasi.urlNpwp },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Detail Koperasi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200">
            <XCircle size={24} />
          </button>
        </div>
        {/* Konten Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Info Koperasi */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-blue-700 mb-2">Informasi Koperasi</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {infoKoperasi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-900">{item.value}</dd></div>))}
              </dl>
          </div>
          {/* Info Lokasi */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-blue-700 mb-2">Lokasi</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {infoLokasi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-900">{item.value}</dd></div>))}
              </dl>
          </div>
          {/* Info PIC */}
           <div className="border-b pb-4">
              <h3 className="font-semibold text-blue-700 mb-2">Penanggung Jawab (PIC)</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {infoPIC.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-900">{item.value}</dd></div>))}
              </dl>
          </div>
          {/* Dokumen */}
          <div>
              <h3 className="font-semibold text-blue-700 mb-2">Dokumen Pendukung</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                 {dokumen.map(doc => (
                    <div key={doc.label}>
                        <p className="text-sm text-gray-500">{doc.label}</p>
                        {doc.url ? (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium hover:text-blue-800">
                                <FileText size={14} /> Lihat Dokumen
                            </a>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Tidak diunggah</span>
                        )}
                    </div>
                 ))}
              </div>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
           <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
});
DetailKoperasiModal.displayName = "DetailKoperasiModal";


// --- Komponen Utama Halaman ---
export default function ManajemenKoperasiPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [selectedKoperasiDetail, setSelectedKoperasiDetail] = useState<Tenant | null>(null); // State untuk modal detail
  // Hapus flag terpisah; gunakan selectedKoperasiDetail sebagai penentu buka/tutup modal
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setTenants(mockAllTenants);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // Fungsi untuk membuka modal detail
  const handleViewDetails = useCallback((tenant: Tenant) => {
    setSelectedKoperasiDetail(tenant);
    setDropdownOpen(null);
  }, []);

  // Fungsi untuk menutup modal detail
  const handleCloseDetailModal = useCallback(() => {
    setSelectedKoperasiDetail(null);
  }, []);


   const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const resetFilters = () => setFilters({ search: '', status: '' });

  const deferredSearch = useDeferredValue(filters.search);
  const filteredTenants = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    const status = filters.status;
    return tenants.filter(t =>
      (t.namaKoperasi.toLowerCase().includes(q) || t.namaPic.toLowerCase().includes(q)) &&
      (status === '' || t.status === status)
    );
  }, [tenants, deferredSearch, filters.status]);

  const handleApprove = (tenantId: string, namaKoperasi: string) => {
    setDropdownOpen(null);
    if (window.confirm(`Setujui koperasi "${namaKoperasi}"?`)) {
      alert(`Simulasi: Koperasi "${namaKoperasi}" disetujui.`);
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'ACTIVE' } : t));
    }
  };

  const handleSuspend = (tenantId: string, namaKoperasi: string) => {
     setDropdownOpen(null);
     if (window.confirm(`Tangguhkan (suspend) koperasi "${namaKoperasi}"?`)) {
        alert(`Simulasi: Koperasi "${namaKoperasi}" ditangguhkan.`);
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'SUSPENDED' } : t));
     }
  };

   const handleActivate = (tenantId: string, namaKoperasi: string) => {
     setDropdownOpen(null);
     if (window.confirm(`Aktifkan kembali koperasi "${namaKoperasi}"?`)) {
        alert(`Simulasi: Koperasi "${namaKoperasi}" diaktifkan kembali.`);
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'ACTIVE' } : t));
     }
  };

  const getStatusBadge = (status: Tenant['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'SUSPENDED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  // Note: hooks must be called before any early return.
  // Skeleton render after hooks declared is safe.
   const getStatusIcon = (status: Tenant['status']) => {
     switch (status) {
        case 'ACTIVE': return <CheckCircle size={14} className="mr-1"/>;
        case 'PENDING': return <Clock size={14} className="mr-1"/>;
        case 'SUSPENDED': return <Slash size={14} className="mr-1"/>;
        default: return null;
     }
   }
   // Efek untuk menutup dropdown jika diklik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cek apakah target klik BUKAN bagian dari tombol dropdown atau menu dropdown
      if (dropdownOpen && !(event.target as HTMLElement).closest(`[data-dropdown-id="${dropdownOpen}"]`)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-9 w-60" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Building /> Manajemen Koperasi (Tenant)
          </h1>
          <p className="mt-1 text-gray-600">Kelola semua koperasi yang terdaftar di platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">

           {/* Area Filter */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Koperasi / PIC</label>
                <div className="relative">
                  <input id="search" name="search" type="text" placeholder="Nama..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status Koperasi</label>
                <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg bg-white">
                  <option value="">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
              </div>
          </div>

        {/* Tabel Koperasi */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Nama Koperasi</th>
                  <th className="p-4 font-medium">PIC Pendaftar</th>
                  <th className="p-4 font-medium">Lokasi</th>
                  <th className="p-4 font-medium">Telepon PIC</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>



              <tbody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                      {/* Kolom Nama Koperasi */}
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{tenant.namaKoperasi}</p>
                        <p className="text-xs text-blue-600">{tenant.subdomain}.sistemkoperasi.id</p>
                      </td>
                      {/* Kolom PIC */}
                      <td className="p-4">
                        <p>{tenant.namaPic}</p>
                        <p className="text-xs text-gray-500">{tenant.emailPic}</p>
                      </td>
                      {/* Kolom Lokasi */}
                      <td className="p-4">
                          <p>{tenant.kota}</p>
                          <p className="text-xs text-gray-500">{tenant.provinsi}</p>
                      </td>
                      {/* Kolom Telepon */}
                      <td className="p-4">{tenant.teleponPic}</td>
                      {/* Kolom Status */}
                      <td className="p-4 text-center">
                        <span className={clsx("inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full", getStatusBadge(tenant.status))}>
                           {getStatusIcon(tenant.status)} {tenant.status}
                        </span>
                      </td>
                      {/* Kolom Aksi */}
                      <td className="p-4 text-center">
                         <div className="relative inline-block text-left" data-dropdown-id={tenant.id}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDropdownOpen(dropdownOpen === tenant.id ? null : tenant.id)}
                              className="px-2 py-1"
                            >
                               <MoreVertical size={16}/>
                            </Button>
                            {dropdownOpen === tenant.id && (
                              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1" role="none">
                                  <button
                                      onClick={() => handleViewDetails(tenant)}
                                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                      <Eye size={16}/> Lihat Detail
                                  </button>
                                  {tenant.status === 'PENDING' && (
                                    <button onClick={() => handleApprove(tenant.id, tenant.namaKoperasi)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                      <CheckCircle size={16}/> Setujui
                                    </button>
                                  )}
                                  {tenant.status === 'ACTIVE' && (
                                     <button onClick={() => handleSuspend(tenant.id, tenant.namaKoperasi)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                      <Slash size={16}/> Tangguhkan
                                     </button>
                                  )}
                                  {tenant.status === 'SUSPENDED' && (
                                      <button onClick={() => handleActivate(tenant.id, tenant.namaKoperasi)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                                          <CheckCircle size={16}/> Aktifkan Kembali
                                      </button>
                                  )}
                                </div>
                              </div>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      {filters.search ? "Tidak ada koperasi yang cocok dengan pencarian." : "Tidak ada data koperasi."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Render Modal Detail */}
      <DetailKoperasiModal
          koperasi={selectedKoperasiDetail}
          onClose={handleCloseDetailModal}
      />
    </div>
  );
}
