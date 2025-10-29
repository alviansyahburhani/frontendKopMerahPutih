// Lokasi: frontend/app/dashboard/admin/daftar-inventaris/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Package, DollarSign, Download, X, Edit } from "lucide-react";
import clsx from "clsx";

// --- Tipe Data ---
type Inventaris = {
    id: string;
    kodeBarang: string;
    namaBarang: string;
    jenis: 'Elektronik' | 'Perabotan' | 'ATK' | 'Kendaraan' | 'Lainnya';
    tanggalPerolehan: string;
    jumlah: number;
    satuan: string;
    nilaiPerolehan: number;
    kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
    lokasi: string;
};

// --- Data Contoh ---
const mockInventaris: Inventaris[] = [
    { id: 'inv001', kodeBarang: 'KMP-LP-01', namaBarang: 'Laptop Lenovo ThinkPad', jenis: 'Elektronik', tanggalPerolehan: '2025-01-10', jumlah: 3, satuan: 'Unit', nilaiPerolehan: 12500000, kondisi: 'Baik', lokasi: 'Ruang Kantor' },
    { id: 'inv002', kodeBarang: 'KMP-PR-01', namaBarang: 'Printer Epson L3210', jenis: 'Elektronik', tanggalPerolehan: '2025-01-10', jumlah: 1, satuan: 'Unit', nilaiPerolehan: 2500000, kondisi: 'Baik', lokasi: 'Ruang Kantor' },
    { id: 'inv003', kodeBarang: 'KMP-MJ-01', namaBarang: 'Meja Kantor', jenis: 'Perabotan', tanggalPerolehan: '2024-12-20', jumlah: 5, satuan: 'Buah', nilaiPerolehan: 750000, kondisi: 'Baik', lokasi: 'Ruang Rapat' },
];

// --- Tipe untuk Form ---
type InventarisFormData = Omit<Inventaris, 'id'>;

// ===================================================================
// KOMPONEN MODAL (Wrapper untuk Form Tambah & Edit)
// ===================================================================
const InventarisModal = ({ isOpen, onClose, onSubmit, title, submitText, initialData }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSubmit: (data: InventarisFormData) => void, 
    title: string, 
    submitText: string,
    initialData: InventarisFormData | null
}) => {
    const [formData, setFormData] = useState<InventarisFormData | null>(null);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (formData) onSubmit(formData);
        onClose();
    };

    if (!isOpen || !formData) return null;
    
    // JSX untuk Form (dipakai bersama)
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="kodeBarang" className="block text-sm font-medium text-gray-700">Kode Barang</label>
                                <input type="text" id="kodeBarang" name="kodeBarang" value={formData.kodeBarang} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg bg-gray-100" readOnly />
                            </div>
                            <div>
                                <label htmlFor="namaBarang" className="block text-sm font-medium text-gray-700">Nama Barang*</label>
                                <input type="text" id="namaBarang" name="namaBarang" required value={formData.namaBarang} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="jenis" className="block text-sm font-medium text-gray-700">Jenis Barang</label>
                                <select id="jenis" name="jenis" value={formData.jenis} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg">
                                    <option value="Elektronik">Elektronik</option>
                                    <option value="Perabotan">Perabotan</option>
                                    <option value="ATK">ATK</option>
                                    <option value="Kendaraan">Kendaraan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tanggalPerolehan" className="block text-sm font-medium text-gray-700">Tanggal Perolehan</label>
                                <input type="date" id="tanggalPerolehan" name="tanggalPerolehan" required value={formData.tanggalPerolehan} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">Jumlah*</label>
                                <input type="number" id="jumlah" name="jumlah" required value={formData.jumlah} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="satuan" className="block text-sm font-medium text-gray-700">Satuan*</label>
                                <input type="text" id="satuan" name="satuan" required value={formData.satuan} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="nilaiPerolehan" className="block text-sm font-medium text-gray-700">Nilai Satuan (Rp)*</label>
                                <input type="number" id="nilaiPerolehan" name="nilaiPerolehan" required value={formData.nilaiPerolehan} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="kondisi" className="block text-sm font-medium text-gray-700">Kondisi</label>
                                <select id="kondisi" name="kondisi" value={formData.kondisi} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg">
                                    <option value="Baik">Baik</option>
                                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                                    <option value="Rusak">Rusak</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">Lokasi Penyimpanan</label>
                                <input type="text" id="lokasi" name="lokasi" required value={formData.lokasi} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{submitText}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function DaftarInventarisPage() {
    const [inventarisList, setInventarisList] = useState<Inventaris[]>([]);
    const [filters, setFilters] = useState({ search: '', kondisi: '', jenis: '' });
    const [loading, setLoading] = useState(true);

    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setInventarisList(mockInventaris);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedInventaris, setSelectedInventaris] = useState<Inventaris | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    
    const ringkasanInventaris = useMemo(() => ({
        totalNilai: inventarisList.reduce((acc, item) => acc + (item.nilaiPerolehan * item.jumlah), 0),
        jumlahItem: inventarisList.reduce((acc, item) => acc + item.jumlah, 0),
    }), [inventarisList]);

    const handleOpenModal = (mode: 'add' | 'edit', item?: Inventaris) => {
        setModalMode(mode);
        setSelectedInventaris(item || null);
        setIsModalOpen(true);
    };

    const handleSave = (data: InventarisFormData) => {
        if (modalMode === 'add') {
            const newItem: Inventaris = { id: `inv-${Date.now()}`, ...data };
            setInventarisList(prev => [newItem, ...prev]);
        } else if (selectedInventaris && modalMode === 'edit') {
            setInventarisList(prev => 
                prev.map(item => item.id === selectedInventaris.id ? { ...selectedInventaris, ...data } : item)
            );
        }
        setIsModalOpen(false);
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => setFilters({ search: '', kondisi: '', jenis: '' });

    const filteredInventaris = useMemo(() => {
        return inventarisList.filter(item => 
            item.namaBarang.toLowerCase().includes(filters.search.toLowerCase()) &&
            (filters.kondisi === '' || item.kondisi === filters.kondisi) &&
            (filters.jenis === '' || item.jenis === filters.jenis)
        );
    }, [filters, inventarisList]);

    const handleExport = async (format: 'pdf' | 'excel') => {
        setIsExportMenuOpen(false); // Langsung tutup menu setelah diklik
        const isFilterActive = filters.search !== '' || filters.kondisi !== '' || filters.jenis !== '';
        const dataToExport = isFilterActive ? filteredInventaris : inventarisList;
        const title = `Laporan Inventaris (${isFilterActive ? 'Hasil Filter' : 'Semua Data'})`;

        if (format === 'pdf') {
            const { generateInventarisPdf } = await import('@/lib/exportUtils');
            generateInventarisPdf(dataToExport, title);
        } else if (format === 'excel') {
            const { generateInventarisExcel } = await import('@/lib/exportUtils');
            generateInventarisExcel(dataToExport, title);
        }
    };
    
    const initialFormDataForAdd: InventarisFormData = {
        kodeBarang: `INV-${Date.now().toString().slice(-6)}`,
        namaBarang: '',
        jenis: 'Lainnya',
        tanggalPerolehan: new Date().toISOString().split('T')[0],
        jumlah: 0,
        satuan: 'Unit',
        nilaiPerolehan: 0,
        kondisi: 'Baik',
        lokasi: '',
    };
    
    // Skeleton kecil
    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    const DaftarInventarisSkeleton = () => (
        <div>
            <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <Skeleton className="h-6 w-1/2 mx-auto text-center" />
                    <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Filter Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="w-full h-10 rounded-lg" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="w-full h-10 rounded-lg" />
                        </div>
                        <div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-12" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b text-sm">
                                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
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
        return <DaftarInventarisSkeleton />;
    }

    return (
        <div>
            <AdminPageHeader
                title="Buku Daftar Inventaris"
                description="Kelola daftar semua aset dan barang milik koperasi."
                actionButton={
                    <Button onClick={() => handleOpenModal('add')} variant="primary">
                        <PlusCircle size={20} /><span>Tambah Inventaris</span>
                    </Button>
                }
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full"><DollarSign className="h-6 w-6 text-green-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Nilai Perolehan Aset</p>
                            <p className="text-xl font-bold text-gray-800">Rp {ringkasanInventaris.totalNilai.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full"><Package className="h-6 w-6 text-blue-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Jumlah Total Barang</p>
                            <p className="text-xl font-bold text-gray-800">{ringkasanInventaris.jumlahItem} Item</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
                        Buku Daftar Inventaris
                    </h2>
                    <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span></div>
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">KOTA MAKASSAR</span></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span></div>
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL CETAK</span><span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full max-w-sm">
                            <input type="text" placeholder="Cari nama barang..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200" value={filters.search} onChange={handleFilterChange} name="search" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="relative ml-4">
                            <Button variant="outline" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
                                <Download size={20} /><span>Ekspor</span>
                            </Button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ekspor ke PDF</button>
                                    <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ekspor ke Excel</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Barang</label>
                            <select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                                <option value="">Semua</option>
                                <option value="Elektronik">Elektronik</option>
                                <option value="Perabotan">Perabotan</option>
                                <option value="ATK">ATK</option>
                                <option value="Kendaraan">Kendaraan</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="kondisi" className="block text-sm font-medium text-gray-600 mb-1">Kondisi</label>
                            <select id="kondisi" name="kondisi" value={filters.kondisi} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                                <option value="">Semua</option>
                                <option value="Baik">Baik</option>
                                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                                <option value="Rusak">Rusak</option>
                            </select>
                        </div>
                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Kode</th>
                                    <th className="p-4 font-medium">Nama Barang</th>
                                    <th className="p-4 font-medium">Jenis</th>
                                    <th className="p-4 font-medium">Tanggal Perolehan</th>
                                    <th className="p-4 font-medium">Jumlah</th>
                                    <th className="p-4 font-medium">Nilai (Rp)</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventaris.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                        <td className="p-4 font-medium">{item.kodeBarang}</td>
                                        <td className="p-4">
                                            <p className="font-semibold text-gray-800">{item.namaBarang}</p>
                                            <p className="text-xs text-gray-500">{item.lokasi}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                {item.jenis}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(item.tanggalPerolehan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="p-4">{item.jumlah} {item.satuan}</td>
                                        <td className="p-4">Rp {item.nilaiPerolehan.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center space-x-2">
                                            <button onClick={() => handleOpenModal('edit', item)} className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition" title="Edit Data">
                                                <Edit size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <InventarisModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                title={modalMode === 'add' ? 'Tambah Inventaris Baru' : 'Edit Data Inventaris'}
                submitText={modalMode === 'add' ? 'Simpan' : 'Simpan Perubahan'}
                initialData={modalMode === 'add' ? initialFormDataForAdd : selectedInventaris}
            />
        </div>
    );
}