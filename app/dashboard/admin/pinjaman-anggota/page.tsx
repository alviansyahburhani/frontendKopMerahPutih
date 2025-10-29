// Lokasi: frontend/app/dashboard/admin/pinjaman-anggota/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, HandCoins, CheckCircle, Clock, X, Send, ChevronDown, MoreHorizontal, CheckCircle2, Hourglass } from "lucide-react";
import clsx from "clsx";

// Import API service
import { loanApi, memberApi, type Member } from "@/lib/apiService";

// Define types (frontend representations are below)

// --- Tipe Data ---
type Pinjaman = {
    id: string;
    loanNumber: string;
    tanggalPinjam: string;
    anggota: {
        id: string;
        nama: string;
    };
    jumlahPinjaman: number;
    jangkaWaktu: number; // dalam bulan
    bunga: number; // dalam persen
    status: 'Aktif' | 'Lunas';
    tanggalLunas: string | null;
    noBukti?: string;
    pekerjaan?: string;
    keperluan?: string;
    jaminan?: string;
};



// --- Tipe untuk data formulir Pinjaman ---
type NewPinjamanData = {
    memberId: string;  // Updated to match backend
    anggotaName?: string; // Display name for optimistic UI
    loanAmount: number;  // Updated to match backend
    interestRate: number;  // Updated to match backend
    loanDate: string;  // Updated to match backend
    termMonths: number;  // Updated to match backend
    purpose?: string;  // Updated to match backend
    agreementNumber?: string;  // Updated to match backend
};

// ===================================================================
// KOMPONEN MODAL CATAT PINJAMAN BARU
// ===================================================================
// Tipe untuk state formData, mengizinkan string kosong untuk angka
type FormDataState = Omit<NewPinjamanData, 'memberId'> & {
    loanAmount: number | '';
    termMonths: number | '';
    interestRate: number | '';
};

const CatatPinjamanModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: NewPinjamanData) => void; }) => {
    // STATE UNTUK FORM UTAMA
    const [formData, setFormData] = useState<FormDataState>({
        agreementNumber: `PJ-${Date.now().toString().slice(-6)}`,
        loanAmount: 0,
        termMonths: 12,
        interestRate: 1.5,
        loanDate: new Date().toISOString().split('T')[0],
        purpose: '',
    });

    // STATE BARU UNTUK LOGIKA PENCARIAN ANGGOTA
    const [namaAnggota, setNamaAnggota] = useState(''); // Teks yang diketik pengguna
    const [hasilPencarian, setHasilPencarian] = useState<Member[]>([]);
    const [anggotaTerpilih, setAnggotaTerpilih] = useState<Member | null>(null);
    const [tidakDitemukan, setTidakDitemukan] = useState(false);
    const [loadingAnggota, setLoadingAnggota] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const anggotaFieldRef = useRef<HTMLDivElement | null>(null);
    const anggotaInputRef = useRef<HTMLInputElement | null>(null);

    // EFEK UNTUK PENCARIAN DENGAN DEBOUNCING
    useEffect(() => {
        if (!namaAnggota.trim() || anggotaTerpilih) {
            setHasilPencarian([]);
            setTidakDitemukan(false);
            setIsDropdownOpen(false);
            return;
        }
        setIsDropdownOpen(true);
        setLoadingAnggota(true);
        const q = namaAnggota.toLowerCase();
        const handler = setTimeout(async () => {
            try {
                const members = await memberApi.getAllMembers();
                const hasil = members.filter((m) => m.fullName.toLowerCase().includes(q));
                setHasilPencarian(hasil);
                setTidakDitemukan(hasil.length === 0 && q.length > 0);
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

    // Fungsi untuk menangani perubahan input form biasa
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Fungsi saat user mengetik nama anggota
    const handleCariAnggota = (e: ChangeEvent<HTMLInputElement>) => {
        const nama = e.target.value;
        setNamaAnggota(nama);
        setAnggotaTerpilih(null);
        setTidakDitemukan(false);
        setIsDropdownOpen(!!nama);
    };

    // Fungsi saat user memilih anggota dari dropdown
    const handlePilihAnggota = (anggota: Member) => {
        setAnggotaTerpilih(anggota);
        setNamaAnggota(anggota.fullName);
        setHasilPencarian([]);
        setIsDropdownOpen(false);
        if (anggotaInputRef.current) anggotaInputRef.current.blur();
    };
    
    // Fungsi saat form disubmit
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!anggotaTerpilih) return;
        const dataFinal: NewPinjamanData = {
            agreementNumber: formData.agreementNumber,
            loanDate: formData.loanDate,
            purpose: formData.purpose,
            memberId: anggotaTerpilih.id,
            anggotaName: anggotaTerpilih.fullName,
            loanAmount: Number(formData.loanAmount) || 0,
            termMonths: Number(formData.termMonths) || 0,
            interestRate: Number(formData.interestRate) || 0,
        };
        onSave(dataFinal);
        onClose();
    };

    // Reset state saat modal ditutup atau dibuka
    useEffect(() => {
        if (isOpen) {
            setFormData({
                agreementNumber: `PJ-${Date.now().toString().slice(-6)}`,
                loanAmount: 0,
                termMonths: 12,
                interestRate: 1.5,
                loanDate: new Date().toISOString().split('T')[0],
                purpose: '',
            });
            setNamaAnggota('');
            setAnggotaTerpilih(null);
            setHasilPencarian([]);
            setTidakDitemukan(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Formulir Pengajuan Pinjaman</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative" ref={anggotaFieldRef}>
                                <label htmlFor="anggotaSearch" className="block text-sm font-medium text-gray-700">Anggota*</label>
                                <input
                                    type="text"
                                    id="anggotaSearch"
                                    name="anggotaSearch"
                                    placeholder="Ketik untuk mencari nama anggota..."
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
                            <div>
                                <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan</label>
                                <input type="text" id="pekerjaan" name="pekerjaan" value={anggotaTerpilih?.occupation || ''} readOnly className="mt-1 w-full p-2 border rounded-lg bg-gray-100" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="agreementNumber" className="block text-sm font-medium text-gray-700">No. Bukti</label>
                                <input type="text" id="agreementNumber" name="agreementNumber" required value={formData.agreementNumber} className="mt-1 w-full p-2 border rounded-lg bg-gray-100" readOnly />
                            </div>
                            <div>
                                <label htmlFor="loanDate" className="block text-sm font-medium text-gray-700">Tanggal Pinjam</label>
                                <input type="date" id="loanDate" name="loanDate" required value={formData.loanDate} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Jumlah Pinjaman (Rp)*</label>
                                <input type="number" id="loanAmount" name="loanAmount" required value={formData.loanAmount} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="termMonths" className="block text-sm font-medium text-gray-700">Jangka Waktu (Bulan)*</label>
                                <input type="number" id="termMonths" name="termMonths" required value={formData.termMonths} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">Jasa (% per bulan)</label>
                                <input type="number" step="0.1" id="interestRate" name="interestRate" required value={formData.interestRate} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Keperluan Pinjaman</label>
                            <textarea id="purpose" name="purpose" rows={2} placeholder="Contoh: Modal usaha, biaya pendidikan..." value={formData.purpose} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={!anggotaTerpilih}>Simpan Pinjaman</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL DETAIL PINJAMAN & ANGSURAN
// ===================================================================
const DetailPinjamanModal = ({ isOpen, onClose, pinjaman }: { isOpen: boolean; onClose: () => void; pinjaman: Pinjaman | null; }) => {
    const [tampilkanRiwayat, setTampilkanRiwayat] = useState(false);

    const detailAngsuran = useMemo(() => {
        if (!pinjaman) return null;

        const angsuranPokok = pinjaman.jangkaWaktu > 0 ? pinjaman.jumlahPinjaman / pinjaman.jangkaWaktu : 0;
        const jasaPerBulan = pinjaman.jumlahPinjaman * (pinjaman.bunga / 100);
        const totalAngsuranPerBulan = angsuranPokok + jasaPerBulan;

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        const semuaAngsuran = Array.from({ length: pinjaman.jangkaWaktu }, (_, i) => {
            const tanggalJatuhTempo = new Date(pinjaman.tanggalPinjam);
            tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + i + 1);
            tanggalJatuhTempo.setHours(0, 0, 0, 0);
            
            const statusSimulasi = hariIni > tanggalJatuhTempo ? 'Terbayar' : 'Belum Dibayar';
            const batasTampilTombol = new Date(tanggalJatuhTempo);
            batasTampilTombol.setDate(batasTampilTombol.getDate() - 7);

            let kondisiAksi = 'MENUNGGU';
            if (statusSimulasi === 'Terbayar') {
                kondisiAksi = 'LUNAS';
            } else if (hariIni >= batasTampilTombol) {
                kondisiAksi = 'SIAP_BAYAR';
            }

            return {
                ke: i + 1,
                jatuhTempo: tanggalJatuhTempo,
                status: statusSimulasi,
                kondisiAksi: kondisiAksi,
            };
        });

        const angsuranTerbayar = semuaAngsuran.filter(a => a.status === 'Terbayar');
        const angsuranBerikutnya = semuaAngsuran.find(a => a.status === 'Belum Dibayar');

        return {
            totalAngsuranPerBulan,
            semuaAngsuran,
            angsuranTerbayar,
            angsuranBerikutnya,
        };
    }, [pinjaman]);

    if (!isOpen || !pinjaman || !detailAngsuran) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Detail Pinjaman: {pinjaman.anggota.nama}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500">Jumlah Pinjaman</p><p className="font-bold text-lg">Rp {pinjaman.jumlahPinjaman.toLocaleString('id-ID')}</p></div>
                        <div><p className="text-gray-500">Jangka Waktu</p><p className="font-bold">{pinjaman.jangkaWaktu} Bulan</p></div>
                        <div><p className="text-gray-500">Jasa</p><p className="font-bold">{pinjaman.bunga}% / Bulan</p></div>
                        <div><p className="text-gray-500">Status</p><p className={`font-bold ${pinjaman.status === 'Lunas' ? 'text-green-600' : 'text-yellow-600'}`}>{pinjaman.status}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-800 mb-2">Angsuran Berikutnya</h3>
                            {detailAngsuran.angsuranBerikutnya ? (
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>Angsuran Ke:</span><span className="font-medium">{detailAngsuran.angsuranBerikutnya.ke}</span></div>
                                    <div className="flex justify-between"><span>Jatuh Tempo:</span><span className="font-medium">{detailAngsuran.angsuranBerikutnya.jatuhTempo.toLocaleDateString('id-ID')}</span></div>
                                    <hr className="my-1"/>
                                    <div className="flex justify-between font-bold text-base"><span>Jumlah Bayar:</span><span>Rp {detailAngsuran.totalAngsuranPerBulan.toLocaleString('id-ID')}</span></div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">Semua angsuran telah lunas.</p>
                            )}
                        </div>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h3 className="font-bold text-green-800 mb-2">Angsuran Selesai</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>Total Terbayar:</span><span className="font-medium">{detailAngsuran.angsuranTerbayar.length} dari {pinjaman.jangkaWaktu} angsuran</span></div>
                                <hr className="my-1"/>
                                <div className="flex justify-between font-bold text-base">
                                    <span>Jumlah Dana Kembali:</span>
                                    <span>Rp {(detailAngsuran.angsuranTerbayar.length * detailAngsuran.totalAngsuranPerBulan).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button onClick={() => setTampilkanRiwayat(!tampilkanRiwayat)} className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg">
                            <span className="font-bold text-gray-700">Riwayat Angsuran Lengkap</span>
                            <ChevronDown className={`transition-transform ${tampilkanRiwayat ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {tampilkanRiwayat && (
                         <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-3 font-medium">Angsuran Ke-</th>
                                        <th className="p-3 font-medium">Jatuh Tempo</th>
                                        <th className="p-3 font-medium">Total Bayar</th>
                                        <th className="p-3 font-medium">Status</th>
                                        <th className="p-3 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailAngsuran.semuaAngsuran.map(ang => (
                                        <tr key={ang.ke} className="border-t">
                                            <td className="p-3">{ang.ke}</td>
                                            <td className="p-3">{ang.jatuhTempo.toLocaleDateString('id-ID')}</td>
                                            <td className="p-3 font-medium">Rp {detailAngsuran.totalAngsuranPerBulan.toLocaleString('id-ID')}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${ang.status === 'Terbayar' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{ang.status}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {ang.kondisiAksi === 'LUNAS' && (
                                                    <div className="flex justify-center items-center gap-1 text-green-600">
                                                        <CheckCircle2 size={14} />
                                                        <span className="text-xs font-semibold">Lunas</span>
                                                    </div>
                                                )}
                                                {ang.kondisiAksi === 'SIAP_BAYAR' && (
                                                    <Button size="sm" variant="outline">Bayar</Button>
                                                )}
                                                {ang.kondisiAksi === 'MENUNGGU' && (
                                                    <div className="flex justify-center items-center gap-1 text-gray-500">
                                                        <Hourglass size={14} />
                                                        <span className="text-xs">Menunggu</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                    <Button type="button" variant="primary" onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </div>
    );
};



// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function PinjamanAnggotaPage() {
    const [filters, setFilters] = useState({ search: '', status: '', tanggalMulai: '', tanggalSelesai: '' });
    const [pinjamanList, setPinjamanList] = useState<Pinjaman[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPinjaman, setSelectedPinjaman] = useState<Pinjaman | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data from backend
    useEffect(() => {
        const fetchPinjaman = async () => {
            try {
                const [loans, members] = await Promise.all([
                    loanApi.getAllLoans(),
                    memberApi.getAllMembers(),
                ]);

                const memberMap = new Map<string, { name: string; occupation: string }>();
                members.forEach(m => memberMap.set(m.id, { name: m.fullName, occupation: m.occupation }));

                // Transform backend data to match frontend format
                const transformedData: Pinjaman[] = loans.map((loan) => {
                    const frontendStatus: 'Aktif' | 'Lunas' = loan.status === 'PAID_OFF' ? 'Lunas' : 'Aktif';
                    const fallback = memberMap.get(loan.memberId);
                    return {
                        id: loan.id,
                        loanNumber: loan.loanNumber,
                        noBukti: loan.agreementNumber,
                        tanggalPinjam: loan.loanDate,
                        anggota: {
                            id: loan.memberId,
                            nama: loan.member?.fullName || fallback?.name || 'Anggota Tidak Dikenal'
                        },
                        jumlahPinjaman: loan.loanAmount,
                        jangkaWaktu: loan.termMonths,
                        bunga: loan.interestRate,
                        status: frontendStatus,
                        tanggalLunas: loan.paidOffDate || null,
                        pekerjaan: loan.member?.occupation || fallback?.occupation,
                        keperluan: loan.purpose,
                        jaminan: loan.agreementNumber ? loan.agreementNumber : '-'
                    };
                });
                setPinjamanList(transformedData);
            } catch (error) {
                console.error('Gagal mengambil data pinjaman:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPinjaman();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ search: '', status: '', tanggalMulai: '', tanggalSelesai: '' });
    };

    const filteredPinjaman = useMemo(() => {
        return pinjamanList.filter(pinjaman => {
            const tanggalPinjam = new Date(pinjaman.tanggalPinjam);
            const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
            const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
            if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
            if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);
            return (
                pinjaman.anggota.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
                (filters.status === '' || pinjaman.status === filters.status) &&
                (!tanggalMulai || tanggalPinjam >= tanggalMulai) &&
                (!tanggalSelesai || tanggalPinjam <= tanggalSelesai)
            );
        });
    }, [filters, pinjamanList]);

    // Skeleton kecil
    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    const PinjamanSkeleton = () => (
        <div>
            <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>
            
            {/* Stat Cards */}
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
                
                <div className="flex justify-end space-x-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b text-sm">
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
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
        return <PinjamanSkeleton />;
    }
    
    const handleNotifikasiMassal = () => {
        const pinjamanAktifCount = pinjamanList.filter(p => p.status === 'Aktif').length;
        if (window.confirm(`Anda akan mengirim notifikasi jatuh tempo ke ${pinjamanAktifCount} anggota. Lanjutkan?`)) {
            alert("Simulasi: Notifikasi massal berhasil dikirim.");
        }
    };
    
    const handleNotifikasiIndividual = (nama: string) => {
        alert(`Simulasi: Notifikasi jatuh tempo berhasil dikirim ke anggota "${nama}".`);
    };

    const handleSavePinjaman = async (data: NewPinjamanData) => {
        try {
            // Transform frontend data to match backend format
            const loanData = {
                memberId: data.memberId,
                loanAmount: data.loanAmount,
                interestRate: data.interestRate,
                loanDate: data.loanDate,
                termMonths: data.termMonths,
                purpose: data.purpose,
                agreementNumber: data.agreementNumber,
            };
            
            const newLoan = await loanApi.createLoan(loanData);
            
            // Transform the response to match frontend format
            const newPinjaman: Pinjaman = {
                id: newLoan.id,
                loanNumber: newLoan.loanNumber,
                noBukti: data.agreementNumber,
                tanggalPinjam: data.loanDate,
                anggota: {
                    id: newLoan.memberId,
                    nama: newLoan.member?.fullName || data.anggotaName || 'Anggota Tidak Dikenal'
                },
                jumlahPinjaman: data.loanAmount,
                jangkaWaktu: data.termMonths,
                bunga: data.interestRate,
                status: 'Aktif',
                tanggalLunas: null,
                pekerjaan: newLoan.member?.occupation,
                keperluan: data.purpose,
                jaminan: data.agreementNumber ? data.agreementNumber : '-'
            };

            setPinjamanList(prev => [newPinjaman, ...prev]);
        } catch (error) {
            console.error('Gagal menyimpan pinjaman:', error);
            alert('Gagal menyimpan pinjaman. Silakan coba lagi.');
        }
    };

    const handleLihatDetail = (pinjaman: Pinjaman) => {
        setSelectedPinjaman(pinjaman);
        setIsDetailModalOpen(true);
    };

    return (
        <div>
            <AdminPageHeader
                title="Buku Pinjaman Anggota"
                description="Kelola semua data pinjaman yang diberikan kepada anggota."
                actionButton={
                    <div className="flex flex-wrap gap-2">
                         <Button onClick={handleNotifikasiMassal} variant="outline">
                            <Send size={18} /><span>Kirim Notifikasi</span>
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)} variant="primary">
                            <PlusCircle size={20} /><span>Catat Pinjaman Baru</span>
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full"><HandCoins className="h-6 w-6 text-red-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Pinjaman Beredar</p>
                            <p className="text-xl font-bold text-gray-800">Rp {pinjamanList.filter(p => p.status === 'Aktif').reduce((sum, p) => sum + p.jumlahPinjaman, 0).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Lunas Bulan Ini</p>
                            <p className="text-xl font-bold text-gray-800">{pinjamanList.filter(p => p.status === 'Lunas' && p.tanggalLunas && new Date(p.tanggalLunas).getMonth() === new Date().getMonth()).length} Pinjaman</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full"><Clock className="h-6 w-6 text-yellow-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Akan Jatuh Tempo</p>
                            <p className="text-xl font-bold text-gray-800">{pinjamanList.filter(p => p.status === 'Aktif').length} Pinjaman</p>
                        </div>
                    </div>
                </div>
            </div>
    
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota</label>
                            <div className="relative">
                                <input id="search" name="search" type="text" placeholder="Nama anggota..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status Pinjaman</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                                <option value="">Semua</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Lunas">Lunas</option>
                            </select>
                        </div>
                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal Pinjam</label>
                            <div className="flex items-center gap-2">
                                <input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                                <span className="text-gray-500">s/d</span>
                                <input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Anggota</th>
                                    <th className="p-4 font-medium text-right">Jumlah Pinjaman</th>
                                    <th className="p-4 font-medium text-center">Jangka Waktu</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPinjaman.map((pinjaman) => (
                                    <tr key={pinjaman.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{pinjaman.anggota.nama}</div>
                                            <div className="text-xs text-gray-500">Tgl Pinjam: {new Date(pinjaman.tanggalPinjam).toLocaleDateString('id-ID')}</div>
                                        </td>
                                        <td className="p-4 text-right font-semibold">Rp {pinjaman.jumlahPinjaman.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center">{pinjaman.jangkaWaktu} bulan</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${pinjaman.status === 'Aktif' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {pinjaman.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <button 
                                                    onClick={() => handleLihatDetail(pinjaman)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    title="Lihat Detail Pinjaman & Angsuran"
                                                >
                                                    <MoreHorizontal size={20}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleNotifikasiIndividual(pinjaman.anggota.nama)}
                                                    disabled={pinjaman.status === 'Lunas'}
                                                    className="text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={pinjaman.status === 'Lunas' ? 'Pinjaman sudah lunas' : 'Kirim notifikasi jatuh tempo'}
                                                >
                                                    <Send size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CatatPinjamanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePinjaman}
            />

            <DetailPinjamanModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                pinjaman={selectedPinjaman}
            />
        </div>
    );
}
