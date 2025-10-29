// Lokasi: frontend/lib/products.ts

// Tipe data Produk (bisa diimpor dari file terpisah nanti)
type Produk = {
  id: string;
  nama: string;
  kategori: 'Sembako' | 'Elektronik' | 'Jasa' | 'Lainnya';
  harga: number;
  status: 'Tersedia' | 'Habis';
  imageUrl: string;
};

// Data mock diambil dari halaman admin katalog Anda
const MOCK_PRODUCTS: Produk[] = [
  { id: 'prod001', nama: 'Beras Premium 5kg', kategori: 'Sembako', harga: 65000, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2016/09/04/13/49/rice-1644148_640.jpg' },
  { id: 'prod002', nama: 'Minyak Goreng Sania 2L', kategori: 'Sembako', harga: 32000, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2016/09/01/14/56/olive-oil-1636220_640.jpg' },
  { id: 'prod003', nama: 'Jasa Pembayaran Listrik & PDAM', kategori: 'Jasa', harga: 2500, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2017/08/26/17/23/indonesia-2684533_640.jpg' },
  { id: 'prod004', nama: 'Televisi LED 32 inch', kategori: 'Elektronik', harga: 1850000, status: 'Habis', imageUrl: 'https://cdn.pixabay.com/photo/2014/01/17/21/28/tv-246920_640.jpg' },
  // Tambahkan produk lain jika perlu dari mockInventaris di halaman admin
  { id: 'prod005', nama: 'Gula Pasir 1kg', kategori: 'Sembako', harga: 14000, status: 'Tersedia', imageUrl: 'https://cdn.pixabay.com/photo/2017/01/06/16/43/sugar-1958469_640.jpg' },
];

// Fungsi untuk mengambil beberapa produk unggulan (misal 4 produk)
export async function fetchFeaturedProducts(limit = 4): Promise<Produk[]> {
  // TODO: Ganti ini dengan fetch API ke backend Anda nanti
  // Contoh: const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?featured=true&limit=${limit}`);
  // const data = await response.json();
  // return data.items;

  // Mengembalikan data mock, filter hanya yang tersedia
  return MOCK_PRODUCTS.filter(p => p.status === 'Tersedia').slice(0, limit);
}

// Fungsi untuk mengambil semua produk (untuk halaman katalog)
export async function fetchAllProducts(): Promise<Produk[]> {
    // TODO: Ganti dengan fetch API ke backend Anda nanti
    return MOCK_PRODUCTS;
}