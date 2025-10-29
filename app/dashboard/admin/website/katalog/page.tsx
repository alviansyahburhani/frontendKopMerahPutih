// Lokasi: frontend/app/dashboard/admin/website/katalog/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit, Trash2, X, Tag, EyeOff } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

// --- Tipe Data ---
type Produk = {
  id: string;
  nama: string;
  kategori: 'Sembako' | 'Elektronik' | 'Jasa' | 'Lainnya';
  harga: number;
  status: 'Tersedia' | 'Habis';
  imageUrl: string;
};

// --- Data Contoh ---
const mockProduk: Produk[] = [
  { id: 'prod001', nama: 'Beras Premium 5kg', kategori: 'Sembako', harga: 65000, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2016/09/04/13/49/rice-1644148_640.jpg' },
  { id: 'prod002', nama: 'Minyak Goreng Sania 2L', kategori: 'Sembako', harga: 32000, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2016/09/01/14/56/olive-oil-1636220_640.jpg' },
  { id: 'prod003', nama: 'Jasa Pembayaran Listrik & PDAM', kategori: 'Jasa', harga: 2500, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2017/08/26/17/23/indonesia-2684533_640.jpg' },
  { id: 'prod004', nama: 'Televisi LED 32 inch', kategori: 'Elektronik', harga: 1850000, status: 'Habis', imageUrl: 'https://cdn.pixabay.com/photo/2014/01/17/21/28/tv-246920_640.jpg' },
  { id: 'prod005', nama: 'Gula Pasir 1kg', kategori: 'Sembako', harga: 14000, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2017/01/06/16/43/sugar-1958469_640.jpg' },
];

export default function ManajemenKatalogPage() {
  const [filters, setFilters] = useState({
    search: '',
    kategori: '',
    status: '',
  });
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setProdukList(mockProduk);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', kategori: '', status: '' });
  };

  const filteredProduk = useMemo(() => {
    return produkList.filter(produk => {
      return (
        produk.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.kategori === '' || produk.kategori === filters.kategori) &&
        (filters.status === '' || produk.status === filters.status)
      );
    });
  }, [produkList, filters]);

  const handleTambahProduk = () => alert("Membuka form untuk menambah produk baru...");

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const KatalogSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-6" />

          {/* Filter Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-8">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
             <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/2 mt-2" />
                </div>
                <div className="flex justify-end gap-2 border-t p-3 bg-gray-50">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <KatalogSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Katalog Produk"
        description="Kelola produk dan jasa yang ditampilkan di landing page."
        actionButton={
            <Button onClick={handleTambahProduk} variant="primary">
                <PlusCircle size={20} /><span>Tambah Produk</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Daftar Produk & Jasa</h2>

          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Nama Produk</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Nama produk..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="kategori" className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
              <select id="kategori" name="kategori" value={filters.kategori} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Sembako">Sembako</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Jasa">Jasa</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
             <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Habis">Habis</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          {/* --- Tampilan Kartu Produk --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProduk.map((produk) => (
              <div key={produk.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow">
                <div className="relative w-full h-40">
                  <Image src={produk.imageUrl} alt={produk.nama} layout="fill" objectFit="cover" />
                   <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      produk.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                   }`}>
                      {produk.status}
                   </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Tag size={12}/> {produk.kategori}</p>
                  <h3 className="font-bold text-gray-800 mt-1 truncate">{produk.nama}</h3>
                  <p className="text-lg font-extrabold text-brand-red-600 mt-2">
                    {produk.kategori === 'Jasa' ? `Biaya Admin: Rp ${produk.harga.toLocaleString('id-ID')}` : `Rp ${produk.harga.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="flex justify-end gap-2 border-t p-3 bg-gray-50">
                    <Button variant="outline" className="text-xs p-2"><Edit size={16}/></Button>
                    <Button variant="outline" className="text-xs p-2"><EyeOff size={16}/></Button>
                    <Button variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={16}/></Button>
                </div>
              </div>
            ))}
            {filteredProduk.length === 0 && (
              <div className="col-span-full text-center p-10 text-gray-500">
                  Tidak ada produk yang sesuai dengan filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}