"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import toast, { Toaster } from 'react-hot-toast';
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Landmark, Gem, CalendarClock, Download, X } from "lucide-react";
import clsx from "clsx";

// Import API service
import { simpananApi, memberApi, type Member, type CreateSimpananTransaksiDto } from "@/lib/apiService";

// Define types
type SimpananTransaksiBackend = {
  id: string;
  tanggal: string;
  nomorBukti?: string;
  uraian: string;
  jenis: string;
  tipe: string;
  jumlah: number;
  memberId: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    fullName: string;
  };
};

type TotalSaldo = {
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
};

// --- Tipe Data ---
type SimpananTransaksi = {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  anggota: {
    id: string;
    nama: string;
  };
  jenis: 'Pokok' | 'Wajib' | 'Sukarela';
  keterangan: string;
  tipe: 'Setoran' | 'Penarikan';
  jumlah: number;
};



type NewTransaksiData = {
  memberId: string;  // Updated to match backend
  anggotaName?: string; // Nama anggota untuk display jika backend tidak include relasi
  jenis: 'Pokok' | 'Wajib' | 'Sukarela';  // Frontend enum for use in state
  tipe: 'Setoran' | 'Penarikan';  // Frontend enum for use in state
  jumlah: number;
  tanggal: string;
  uraian: string;  // Updated to match backend field name
};

// Tipe khusus untuk state form agar input jumlah bisa dikosongkan saat mengetik
type NewTransaksiFormState = Omit<NewTransaksiData, 'jumlah'> & { jumlah: number | '' };

// ===================================================================
// KOMPONEN MODAL UNTUK TRANSAKSI
// ===================================================================
const TransaksiSimpananModal = ({
    isOpen,
    onClose,
    onSave,
    tipe
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NewTransaksiData, tipe: 'Setoran' | 'Penarikan') => void;
    tipe: 'Setoran' | 'Penarikan' | null;
}) => {
    const [formData, setFormData] = useState<NewTransaksiFormState>({
        memberId: '',
        jenis: tipe === 'Penarikan' ? 'Sukarela' : 'Wajib', // Default berbeda untuk penarikan
        tipe: tipe || 'Setoran', // Default to 'Setoran' if tipe is null
        jumlah: '',
        tanggal: new Date().toISOString().split('T')[0],
        uraian: '',
    });

    const [namaAnggota, setNamaAnggota] = useState(''); // Teks yang diketik pengguna
    const [hasilPencarian, setHasilPencarian] = useState<Member[]>([]);
    const [anggotaTerpilih, setAnggotaTerpilih] = useState<Member | null>(null);
    const [tidakDitemukan, setTidakDitemukan] = useState(false);
    const [loadingAnggota, setLoadingAnggota] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Refs untuk handle klik di luar dan blur input
    const anggotaFieldRef = useRef<HTMLDivElement | null>(null);
    const anggotaInputRef = useRef<HTMLInputElement | null>(null);

    // EFEK UNTUK PENCARIAN DENGAN DEBOUNCING
    useEffect(() => {
        // Tutup dropdown bila tidak ada teks atau sudah memilih anggota
        if (!namaAnggota.trim() || anggotaTerpilih) {
            setHasilPencarian([]);
            setTidakDitemukan(false);
            setIsDropdownOpen(false);
            return;
        }

        setIsDropdownOpen(true);
        setLoadingAnggota(true);

        // Simpan query saat ini untuk mencegah race-condition
        const currentQuery = namaAnggota.toLowerCase();
        const handler = setTimeout(async () => {
            try {
                const members = await memberApi.getAllMembers();
                const hasil = members.filter((member) =>
                    member.fullName.toLowerCase().includes(currentQuery)
                );
                setHasilPencarian(hasil);
                // Tampilkan pesan tidak ditemukan hanya setelah debounce selesai dan tidak loading
                setTidakDitemukan(hasil.length === 0 && currentQuery.length > 0);
            } catch (error) {
                console.error('Gagal mengambil data anggota:', error);
                setTidakDitemukan(true);
            } finally {
                setLoadingAnggota(false);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [namaAnggota, anggotaTerpilih]);

    // Tutup dropdown ketika klik di luar field anggota
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (anggotaFieldRef.current && !anggotaFieldRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // Reset form ketika modal dibuka atau tipe berubah
    useEffect(() => {
        if (isOpen) {
            setFormData({
                memberId: '',
                jenis: tipe === 'Penarikan' ? 'Sukarela' : 'Wajib',
                tipe: tipe || 'Setoran',
                jumlah: '',
                tanggal: new Date().toISOString().split('T')[0],
                uraian: '',
            });
            setNamaAnggota('');
            setAnggotaTerpilih(null);
            setHasilPencarian([]);
            setTidakDitemukan(false);
        }
    }, [isOpen, tipe]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (name === 'jumlah') {
            if (value === '') {
                setFormData(prev => ({ ...prev, jumlah: '' }));
            } else {
                const num = Number(value);
                setFormData(prev => ({ ...prev, jumlah: Number.isNaN(num) ? '' : num }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Fungsi saat user mengetik nama anggota
    const handleCariAnggota = (e: ChangeEvent<HTMLInputElement>) => {
        const nama = e.target.value;
        setNamaAnggota(nama);
        setAnggotaTerpilih(null);
        setTidakDitemukan(false); // reset pesan ketika user mengetik ulang
        setIsDropdownOpen(!!nama);
    };

    // Fungsi saat user memilih anggota dari dropdown
    const handlePilihAnggota = (anggota: Member) => {
        setAnggotaTerpilih(anggota);
        setNamaAnggota(anggota.fullName);
        setFormData(prev => ({ ...prev, memberId: anggota.id, anggotaName: anggota.fullName }));
        setHasilPencarian([]);
        setIsDropdownOpen(false);
        // Blur input agar dropdown native lain tidak memicu pencarian lagi
        if (anggotaInputRef.current) anggotaInputRef.current.blur();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!anggotaTerpilih || !tipe) return; // Add check for tipe
        const jumlahNumber = typeof formData.jumlah === 'string' ? Number(formData.jumlah) : formData.jumlah;
        if (!jumlahNumber || jumlahNumber < 1) {
            toast.error('Jumlah harus lebih dari 0.');
            return;
        }
        
        const dataToSend: NewTransaksiData = {
            ...formData,
            memberId: anggotaTerpilih.id,
            anggotaName: anggotaTerpilih.fullName,
            // Paksa jenis 'Sukarela' untuk penarikan agar lolos validasi backend
            jenis: tipe === 'Penarikan' ? 'Sukarela' : formData.jenis,
            tipe,
            jumlah: jumlahNumber,
        };
        
        onSave(dataToSend, tipe);
        onClose();
    };

    if (!isOpen || !tipe) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Catat {tipe} Simpanan</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="relative" ref={anggotaFieldRef}>
                            <label htmlFor="anggotaSearch" className="block text-sm font-medium text-gray-700">Anggota*</label>
                            <input
                                type="text"
                                id="anggotaSearch"
                                name="anggotaSearch"
                                placeholder="Cari nama anggota..."
                                value={namaAnggota}
                                onChange={handleCariAnggota}
                                className="mt-1 w-full p-2 border rounded-lg"
                                autoComplete="off"
                                ref={anggotaInputRef}
                            />
                            {isDropdownOpen && loadingAnggota && (
                                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg p-2">
                                    <p className="text-sm text-gray-500">Memuat...</p>
                                </div>
                            )}
                            {isDropdownOpen && hasilPencarian.length > 0 && !loadingAnggota && (
                                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                                    {hasilPencarian.map(anggota => (
                                        <div
                                            key={anggota.id}
                                            onClick={() => handlePilihAnggota(anggota)}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            {anggota.fullName}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isDropdownOpen && tidakDitemukan && !loadingAnggota && (
                                <p className="text-sm text-red-600 mt-1">Anggota tidak ditemukan.</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="jenis" className="block text-sm font-medium text-gray-700">Jenis Simpanan*</label>
                                <select id="jenis" name="jenis" required value={formData.jenis} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg bg-white">
                                    {tipe === 'Setoran' && <option value="Pokok">Pokok</option>}
                                    {tipe === 'Setoran' && <option value="Wajib">Wajib</option>}
                                    <option value="Sukarela">Sukarela</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">Jumlah (Rp)*</label>
                                <input type="number" id="jumlah" name="jumlah" required min="1" value={formData.jumlah} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal Transaksi*</label>
                            <input type="date" id="tanggal" name="tanggal" required value={formData.tanggal} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="uraian" className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <textarea id="uraian" name="uraian" rows={2} value={formData.uraian} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={!anggotaTerpilih || formData.jumlah === '' || (typeof formData.jumlah === 'number' && formData.jumlah < 1)}>Simpan Transaksi</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function SimpananAnggotaPage() {
    const [filters, setFilters] = useState({ search: '', tipe: '', jenis: '', tanggalMulai: '', tanggalSelesai: '' });
    const [transaksiList, setTransaksiList] = useState<SimpananTransaksi[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Setoran' | 'Penarikan' | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTransaksi, setSelectedTransaksi] = useState<SimpananTransaksi | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const filterDebounceRef = useRef<number | null>(null);
    const [aksesTerbatas, setAksesTerbatas] = useState(false);
    const [totalSaldo, setTotalSaldo] = useState({ pokok: 0, wajib: 0, sukarela: 0 });

    // Fetch data from backend
    useEffect(() => {
        const fetchSimpananData = async () => {
            try {
                // Fetch transaction history
                const transactions: SimpananTransaksiBackend[] = await simpananApi.getAllTransactions();
                
                // Transform backend data to match frontend format
                const transformedTransactions: SimpananTransaksi[] = transactions.map((trx) => {
                    // Convert backend enum values to frontend enum values
                    const frontendJenis: 'Pokok' | 'Wajib' | 'Sukarela' = 
                        trx.jenis === 'POKOK' ? 'Pokok' :
                        trx.jenis === 'WAJIB' ? 'Wajib' : 'Sukarela';
                    
                    const frontendTipe: 'Setoran' | 'Penarikan' = 
                        trx.tipe === 'SETORAN' ? 'Setoran' : 'Penarikan';
                    
                    return {
                        id: trx.id,
                        tanggal: new Date(trx.tanggal).toISOString().split('T')[0],
                        anggota: {
                            id: trx.memberId,
                            nama: trx.member?.fullName || 'Anggota Tidak Dikenal'
                        },
                        jenis: frontendJenis,
                        keterangan: trx.uraian,
                        tipe: frontendTipe,
                        jumlah: trx.jumlah
                    };
                });
                
                setTransaksiList(transformedTransactions);

                // Fetch total saldo dari backend; jika 403 ditangani menjadi 0, turunkan dari transaksi
                const saldo: TotalSaldo = await simpananApi.getTotalSaldo();
                let nextTotal = {
                    pokok: saldo.saldoPokok || 0,
                    wajib: saldo.saldoWajib || 0,
                    sukarela: saldo.saldoSukarela || 0,
                };

                // Fallback: hitung dari transaksi yang ada apabila total dari API semua 0
                const isApiZero = nextTotal.pokok === 0 && nextTotal.wajib === 0 && nextTotal.sukarela === 0;
                if (isApiZero && transformedTransactions.length > 0) {
                    nextTotal = transformedTransactions.reduce(
                        (acc, trx) => {
                            const sign = trx.tipe === 'Setoran' ? 1 : -1;
                            if (trx.jenis === 'Pokok') acc.pokok += sign * trx.jumlah;
                            else if (trx.jenis === 'Wajib') acc.wajib += sign * trx.jumlah;
                            else if (trx.jenis === 'Sukarela') acc.sukarela += sign * trx.jumlah;
                            return acc;
                        },
                        { pokok: 0, wajib: 0, sukarela: 0 },
                    );
                }

                setTotalSaldo(nextTotal);

                // Jika data kosong seluruhnya, kemungkinan akses terbatas (403 ditangani diam-diam)
                const isEmptyAll =
                    transformedTransactions.length === 0 &&
                    (saldo.saldoPokok || 0) === 0 &&
                    (saldo.saldoWajib || 0) === 0 &&
                    (saldo.saldoSukarela || 0) === 0;
                setAksesTerbatas(isEmptyAll);
        } catch (error) {
            console.error('Gagal mengambil data simpanan:', error);
        } finally {
            setLoading(false);
        }
        };
        fetchSimpananData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setTableLoading(true);
        if (filterDebounceRef.current) window.clearTimeout(filterDebounceRef.current);
        filterDebounceRef.current = window.setTimeout(() => setTableLoading(false), 250);
    };

    const resetFilters = () => {
        setFilters({ search: '', tipe: '', jenis: '', tanggalMulai: '', tanggalSelesai: '' });
        setTableLoading(true);
        if (filterDebounceRef.current) window.clearTimeout(filterDebounceRef.current);
        filterDebounceRef.current = window.setTimeout(() => setTableLoading(false), 250);
    };

    const filteredTransaksi = useMemo(() => {
        return transaksiList.filter(trx => {
            const tanggalTrx = new Date(trx.tanggal);
            const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
            const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
            if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
            if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);
            return (
                trx.anggota.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
                (filters.tipe === '' || 
                 (filters.tipe === 'Setoran' && trx.tipe === 'Setoran') || 
                 (filters.tipe === 'Penarikan' && trx.tipe === 'Penarikan')) &&
                (filters.jenis === '' || 
                 (filters.jenis === 'Pokok' && trx.jenis === 'Pokok') ||
                 (filters.jenis === 'Wajib' && trx.jenis === 'Wajib') ||
                 (filters.jenis === 'Sukarela' && trx.jenis === 'Sukarela')) &&
                (!tanggalMulai || tanggalTrx >= tanggalMulai) &&
                (!tanggalSelesai || tanggalTrx <= tanggalSelesai)
            );
        });
    }, [filters, transaksiList]);

    // Skeleton kecil
    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    const SimpananSkeleton = () => (
        <div>
            <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            {/* Stat Cards */}
            {aksesTerbatas && (
                <div className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-sm text-yellow-800">
                    Anda tidak memiliki akses untuk melihat data simpanan. Menampilkan tampilan terbatas.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Action Bar */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
                
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-40" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        {loading ? (
                            <Skeleton className="h-6 w-40" />
                        ) : (
                            <h2 className="text-lg font-bold text-gray-700">Riwayat Transaksi</h2>
                        )}
                        <div className="relative">
                            {loading ? (
                                <Skeleton className="h-10 w-28" />
                            ) : (
                                <Button variant="outline" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
                                    <Download size={18}/> <span>Ekspor</span>
                                </Button>
                            )}
                            {!loading && isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unduh Laporan (PDF)</button>
                                    <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unduh Laporan (Excel)</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        {loading ? (
                            <>
                                <div className="lg:col-span-2">
                                    <Skeleton className="h-4 w-28 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-28 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-28 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div>
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3">
                                    <Skeleton className="h-4 w-36 mb-2" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-10 w-full" />
                                        <span className="text-gray-300">s/d</span>
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="lg:col-span-2"><label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota</label><div className="relative"><input id="search" name="search" type="text" placeholder="Nama anggota..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /></div></div>
                                <div><label htmlFor="tipe" className="block text-sm font-medium text-gray-600 mb-1">Tipe Transaksi</label><select id="tipe" name="tipe" value={filters.tipe} onChange={handleFilterChange} className="w-full p-2 border rounded-lg"><option value="">Semua</option><option value="Setoran">Setoran</option><option value="Penarikan">Penarikan</option></select></div>
                                <div><label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Simpanan</label><select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg"><option value="">Semua</option><option value="Pokok">Pokok</option><option value="Wajib">Wajib</option><option value="Sukarela">Sukarela</option></select></div>
                                <div><Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button></div>
                                <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal</label><div className="flex items-center gap-2"><input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" /><span className="text-gray-500">s/d</span><input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" /></div></div>
                            </>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-12" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b text-sm">
                                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <SimpananSkeleton />;
    }
    
    const handleOpenModal = (tipe: 'Setoran' | 'Penarikan') => {
        setModalType(tipe);
        setIsModalOpen(true);
    };

    const handleOpenDetail = (trx: SimpananTransaksi) => {
        setSelectedTransaksi(trx);
        setIsDetailOpen(true);
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        setSelectedTransaksi(null);
    };
    
    const handleSaveTransaksi = async (data: NewTransaksiData, tipe: 'Setoran' | 'Penarikan') => {
        try {
            // Transform frontend data to match backend format
            const transactionData: CreateSimpananTransaksiDto = {
                memberId: data.memberId,
                jenis: data.jenis === 'Pokok' ? 'POKOK' : 
                       data.jenis === 'Wajib' ? 'WAJIB' : 'SUKARELA',  // Convert frontend to backend enum
                tipe: tipe === 'Setoran' ? 'SETORAN' : 'PENARIKAN',  // Convert frontend to backend enum
                jumlah: data.jumlah,
                uraian: data.uraian,
            };
            
            const newTransaction = await simpananApi.createTransaction(transactionData);
            
            // Transform the response to match frontend format
            const newTransaksi: SimpananTransaksi = {
                id: newTransaction.id,
                tanggal: new Date(newTransaction.tanggal).toISOString().split('T')[0],
                anggota: {
                    id: newTransaction.memberId,
                    nama: newTransaction.member?.fullName || data.anggotaName || 'Anggota Tidak Dikenal'
                },
                jenis: newTransaction.jenis === 'POKOK' ? 'Pokok' : 
                       newTransaction.jenis === 'WAJIB' ? 'Wajib' : 'Sukarela',
                keterangan: newTransaction.uraian,
                tipe: tipe, // Use the original frontend tipe from argument
                jumlah: newTransaction.jumlah,
            };
            
            setTransaksiList(prev => [newTransaksi, ...prev]);
            
            // Update total saldo
            const newTotalSaldo = { ...totalSaldo };
            if (newTransaksi.jenis === 'Pokok') {
                newTotalSaldo.pokok += newTransaksi.tipe === 'Setoran' ? newTransaksi.jumlah : -newTransaksi.jumlah;
            } else if (newTransaksi.jenis === 'Wajib') {
                newTotalSaldo.wajib += newTransaksi.tipe === 'Setoran' ? newTransaksi.jumlah : -newTransaksi.jumlah;
            } else if (newTransaksi.jenis === 'Sukarela') {
                newTotalSaldo.sukarela += newTransaksi.tipe === 'Setoran' ? newTransaksi.jumlah : -newTransaksi.jumlah;
            }
            setTotalSaldo(newTotalSaldo);
        } catch (error: unknown) {
            let message = 'Gagal menyimpan transaksi. Silakan coba lagi.';
            if (typeof error === 'object' && error !== null) {
                const maybeResp = (error as { response?: { data?: { message?: string | string[] } } }).response;
                const apiMsg = maybeResp?.data?.message;
                if (Array.isArray(apiMsg)) {
                    message = apiMsg.join(', ');
                } else if (typeof apiMsg === 'string') {
                    message = apiMsg;
                }
            }
            console.error('Gagal menyimpan transaksi:', error);
            toast.error(message);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (format === 'pdf') {
            // Panggil nama fungsi yang benar dari exportUtils
            const { generateSimpananPdf } = await import('@/lib/exportUtils');
            generateSimpananPdf(filteredTransaksi);
        } else if (format === 'excel') {
            // Panggil nama fungsi yang benar dari exportUtils
            const { generateSimpananExcel } = await import('@/lib/exportUtils');
            generateSimpananExcel(filteredTransaksi);
        }
    };
    
    return (
        <div>
            <AdminPageHeader
                title="Buku Simpanan Anggota"
                description="Kelola semua transaksi simpanan pokok, wajib, dan sukarela anggota."
                actionButton={
                    <div className="flex gap-2">
                        <Button onClick={() => handleOpenModal('Setoran')} variant="primary">
                            <PlusCircle size={20} /><span>Catat Setoran</span>
                        </Button>
                        <Button onClick={() => handleOpenModal('Penarikan')} variant="outline">
                            <PlusCircle size={20} /><span>Catat Penarikan</span>
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><div className="flex items-center gap-3"><div className="p-3 bg-blue-100 rounded-full"><Landmark className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Simpanan Pokok</p><p className="text-xl font-bold text-gray-800">Rp {totalSaldo.pokok.toLocaleString('id-ID')}</p></div></div></div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><div className="flex items-center gap-3"><div className="p-3 bg-green-100 rounded-full"><CalendarClock className="h-6 w-6 text-green-600" /></div><div><p className="text-sm text-gray-500">Total Simpanan Wajib</p><p className="text-xl font-bold text-gray-800">Rp {totalSaldo.wajib.toLocaleString('id-ID')}</p></div></div></div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><div className="flex items-center gap-3"><div className="p-3 bg-purple-100 rounded-full"><Gem className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm text-gray-500">Total Simpanan Sukarela</p><p className="text-xl font-bold text-gray-800">Rp {totalSaldo.sukarela.toLocaleString('id-ID')}</p></div></div></div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-700">Riwayat Transaksi</h2>
                        <div className="relative">
                            <Button variant="outline" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
                                <Download size={18}/> <span>Ekspor</span>
                            </Button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unduh Laporan (PDF)</button>
                                    <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unduh Laporan (Excel)</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-2"><label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota</label><div className="relative"><input id="search" name="search" type="text" placeholder="Nama anggota..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /></div></div>
                        <div><label htmlFor="tipe" className="block text-sm font-medium text-gray-600 mb-1">Tipe Transaksi</label><select id="tipe" name="tipe" value={filters.tipe} onChange={handleFilterChange} className="w-full p-2 border rounded-lg"><option value="">Semua</option><option value="Setoran">Setoran</option><option value="Penarikan">Penarikan</option></select></div>
                        <div><label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Simpanan</label><select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg"><option value="">Semua</option><option value="Pokok">Pokok</option><option value="Wajib">Wajib</option><option value="Sukarela">Sukarela</option></select></div>
                        <div><Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button></div>
                        <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal</label><div className="flex items-center gap-2"><input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" /><span className="text-gray-500">s/d</span><input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" /></div></div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Tanggal</th>
                                    <th className="p-4 font-medium">Anggota</th>
                                    <th className="p-4 font-medium">Jenis Simpanan</th>
                                    <th className="p-4 font-medium">Keterangan</th>
                                    <th className="p-4 font-medium text-right">Jumlah (Rp)</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(loading || tableLoading) ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="border-b text-sm">
                                            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                            <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                                            <td className="p-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                                            <td className="p-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredTransaksi.length > 0 ? (
                                    filteredTransaksi.map((trx) => (
                                        <tr key={trx.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                            <td className="p-4">{new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="p-4 font-medium text-gray-800">{trx.anggota.nama}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    trx.jenis === 'Pokok' ? 'bg-blue-100 text-blue-700' : 
                                                    trx.jenis === 'Wajib' ? 'bg-green-100 text-green-700' : 
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {trx.jenis}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{trx.keterangan}</td>
                                            <td className={`p-4 text-right font-semibold ${
                                                trx.tipe === 'Setoran' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {trx.tipe === 'Penarikan' ? '-' : ''}{trx.jumlah.toLocaleString('id-ID')}
                                            </td>
                                        <td className="p-4 text-center"><button onClick={() => handleOpenDetail(trx)} className="text-blue-600 hover:underline text-xs font-medium">Lihat Detail</button></td>
                                    </tr>
                                ))
                            ) : (
                                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">Tidak ada transaksi yang sesuai dengan filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TransaksiSimpananModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaksi}
                tipe={modalType}
            />

            {isDetailOpen && selectedTransaksi && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Detail Transaksi Simpanan</h2>
                            <button type="button" onClick={closeDetail} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Tanggal</span><span className="font-medium">{new Date(selectedTransaksi.tanggal).toLocaleDateString('id-ID')}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Anggota</span><span className="font-medium">{selectedTransaksi.anggota.nama}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Jenis Simpanan</span><span className="font-medium">{selectedTransaksi.jenis}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Tipe Transaksi</span><span className="font-medium">{selectedTransaksi.tipe}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Jumlah</span><span className="font-semibold">Rp {selectedTransaksi.jumlah.toLocaleString('id-ID')}</span></div>
                            <div>
                                <span className="text-gray-600 block">Keterangan</span>
                                <p className="mt-1 text-gray-800">{selectedTransaksi.keterangan || '-'}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                            <Button type="button" variant="primary" onClick={closeDetail}>Tutup</Button>
                        </div>
                    </div>
                </div>
            )}
            <Toaster position="top-right" />
        </div>
    );
}
