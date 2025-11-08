// Lokasi: alviansyahburhani/frontendkopmerahputih/frontendKopMerahPutih-2d28dba419adfcc919625f86c3f6e3cf404c0119/app/(publik)/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, useRef, useMemo} from "react";
import Button from "@/components/Button";
import Image from "next/image";
// --- [MODIFIKASI] Hapus impor GALLERY_IMAGES ---
import Gallery from "@/components/Gallery";
import Link from "next/link";
import { NewsItem } from "@/components/NewsTypes"; // Tipe yang diharapkan NewsCard
import NewsCard from "@/components/NewsCard";
import QuoteFader from "@/components/QuoteFader";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";
import clsx from "clsx"; // Pastikan clsx diimpor untuk skeleton

// --- Impor service dan tipe data backend ---
import { publicService } from "@/services/public.service";
import type { 
  News, 
  ApiErrorResponse,
  // --- [TAMBAHAN] Impor GalleryItem ---
  GalleryItem
} from "@/types/api.types";
import type { 
  Product as PublicProduct 
} from "@/services/public.service"; 
// --- (Akhir Impor Baru) ---
import { superAdminService } from "@/services/superadmin.service";
const MAIN_DOMAINS = [
  'localhost', 
  'sistemkoperasi.id' // Ganti jika domain produksi Anda berbeda
];

/* =========================
   TIPE DATA & UTIL
   ========================= */

// Hasil search koperasi
type KoperasiSearchResult = {
  id: string;
  nama: string;
  subdomain: string;
};

// Tipe final yang dipakai ProductCard
type ProdukKategori = "Sembako" | "Elektronik" | "Jasa" | "Lainnya";
type ProdukStatus = "Tersedia" | "Habis";

export type Produk = {
  id: string;
  nama: string;
  harga: number;
  imageUrl: string;
  kategori: ProdukKategori | string; 
  status: ProdukStatus;
};

// --- [TAMBAHAN] Tipe data untuk UI Galeri ---
type GalleryImage = {
  src: string;
  alt: string;
};


/* =========================
   KOMPONEN HALAMAN
   ========================= */
export default function Home() {
  // Data awal
  const [latest, setLatest] = useState<NewsItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Produk[]>([]);
  // --- [TAMBAHAN] State untuk Galeri ---
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [dataLoading, setDataLoading] = useState(true); 
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({});
  // Search interaktif
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<KoperasiSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  // --- [TAMBAHKAN BLOK INI] ---
  // Gunakan useMemo untuk membuat string JSON dari platformSettings
  const quotesJsonStringForFader = useMemo(() => {
    // Hanya jalankan jika kita di domain utama DAN settings sudah terisi
    if (isMainDomain && (platformSettings.section2Quote1Text || platformSettings.section2Quote2Text)) {
      const quotesArray = [];

      // Cek dan tambahkan kutipan 1
      if (platformSettings.section2Quote1Text && platformSettings.section2Quote1Author) {
        quotesArray.push({
          text: platformSettings.section2Quote1Text,
          author: platformSettings.section2Quote1Author,
        });
      }
      
      // Cek dan tambahkan kutipan 2
      if (platformSettings.section2Quote2Text && platformSettings.section2Quote2Author) {
        quotesArray.push({
          text: platformSettings.section2Quote2Text,
          author: platformSettings.section2Quote2Author,
        });
      }

      // Ubah array menjadi string JSON
      return JSON.stringify(quotesArray);
    }
    
    // Fallback jika tidak ada data atau bukan di domain utama
    return '[]';
  }, [isMainDomain, platformSettings]);

  // --- [DIMODIFIKASI] Ambil data awal (termasuk Galeri) ---
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true); 
      try {
        // --- [MODIFIKASI] Panggil semua 3 API ---
        const [newsResult, productResult, galleryResult] = await Promise.all([
          publicService.getPublishedNewsClient(1, 3),
          publicService.getPublishedProductsClient(1, 4),
          publicService.getPublicGalleryClient(1, 6) // Ambil 6 gambar
        ]);
        
        // 2. Mapping data Berita (News) ke NewsItem (untuk NewsCard)
        const newsData: NewsItem[] = newsResult.data.map((n: News): NewsItem => ({
          id: n.id,
          slug: n.slug,
          title: n.title,
          excerpt: n.excerpt || '',
          content: n.content || '',
          image: n.imageUrl || "/images/merahputih-rmv.png", 
          publishedAt: n.publishedAt || n.createdAt,
        }));

        // 3. Mapping data Produk (PublicProduct) ke Produk (untuk ProductCard)
        const productData: Produk[] = productResult.data.map((p: PublicProduct): Produk => ({
          id: p.id,
          nama: p.name,
          harga: p.price,
          imageUrl: p.imageUrl || "/images/merahputih-rmv.png", 
          kategori: p.category?.name || 'Lainnya',
          status: p.isAvailable ? 'Tersedia' : 'Habis',
        }));

        // 4. --- [TAMBAHAN] Mapping Galeri ---
        const galleryData: GalleryImage[] = galleryResult.data.map((g: GalleryItem): GalleryImage => ({
          src: g.imageUrl,
          alt: g.description || "Foto Galeri Koperasi"
        }));

        setLatest(newsData);
        setFeaturedProducts(productData);
        setGalleryImages(galleryData); // --- [TAMBAHAN] Set state galeri

      } catch (err: unknown) {
        const apiError = err as ApiErrorResponse;
        console.error("Gagal mengambil data awal landing page:", apiError.message || err);
      } finally {
        setDataLoading(false); 
      }
    };
    
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const mainDomain = MAIN_DOMAINS.includes(hostname);
      setIsMainDomain(mainDomain);

      if (mainDomain) {
        // --- KITA DI DOMAIN UTAMA ---
        // Panggil service yang mengembalikan OBJEK { key: 'value', ... }
        superAdminService.getPublicPlatformSettings()
          .then(settings => {
            setPlatformSettings(settings);
          })
          .catch(err => {
            console.error("Gagal fetch platform settings:", err);
          })
          .finally(() => {
            // Sembunyikan skeleton (karena 'loadData' tidak dipanggil)
            setDataLoading(false); 
          });
      } else {
        // --- KITA DI SUBDOMAIN ---
        // Panggil data tenant (Berita, Produk, Galeri)
        loadData();
      }
    }

    // Cleanup debounce
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []); // [] = Jalankan sekali saat komponen dimuat

  // Fetch hasil pencarian (debounce)
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoadingSearch(true);
    setShowDropdown(true);

    try {
      // TODO: Ganti ini dengan API search tenant
      // const results = await publicService.searchTenants(query);
      
      // Mock sementara (sesuai kode Anda)
      await new Promise((resolve) => setTimeout(resolve, 300));
      const mockData: KoperasiSearchResult[] = [
        { id: "1", nama: "Koperasi Maju Jaya", subdomain: "majujaya" },
        { id: "2", nama: "Koperasi Warga Sejahtera", subdomain: "wargasejahtera" },
        { id: "3", nama: "Kopdes Sumber Rejeki", subdomain: "sumberrejeki" },
      ].filter((k) => k.nama.toLowerCase().includes(query.toLowerCase()));

      setSearchResults(mockData);
    } catch (err) {
      console.error("Gagal mencari koperasi:", err);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchSearchResults(query), 300);
  };

  // Redirect subdomain (dev vs prod) - Tidak berubah
  const redirectToSubdomain = (subdomain: string) => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost";
      const protocol = window.location.protocol;
      const rootDomain = isLocal ? "localhost:3000" : "sistemkoperasi.id"; // Sesuaikan jika domain produksi beda
      window.location.href = isLocal
        ? `${protocol}//${rootDomain}/${subdomain}` // Asumsi mode local dev
        : `${protocol}//${subdomain}.${rootDomain}`;
    }
  };

  // Tutup dropdown saat klik di luar - Tidak berubah
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchWrapperRef]);

 

  /* =========================
     RENDER
     ========================= */
  return (
    <>
      {/* HERO SECTION (Tidak berubah) */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <Image
          src={platformSettings.heroImageUrl || "https://cdn.pixabay.com/photo/2023/05/04/02/24/bali-7969001_1280.jpg"}
          alt="Koperasi"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg">
            {platformSettings.heroTitle || "Koperasi Merah Putih"}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md">
            {platformSettings.heroSubtitle || "Bersama membangun kesejahteraan anggota melalui simpanan, pinjaman, dan layanan koperasi modern."}
          </p>

          {/* SEARCH BAR (Tidak berubah) */}
          {isMainDomain && (
          <div ref={searchWrapperRef} className="mt-8 mb-4 max-w-lg w-full relative">
            <form className="relative flex w-full">
              <label htmlFor="search-koperasi" className="sr-only">
                Cari Koperasi
              </label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search-koperasi"
                type="search"
                name="q"
                placeholder="Cari koperasi terdaftar..."
                className="block w-full rounded-full border-2 border-transparent bg-white/90 pl-12 pr-6 py-3 text-gray-900 placeholder:text-gray-500 shadow-md transition focus:border-brand-red-500 focus:ring-brand-red-500 focus:bg-white"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.trim() && fetchSearchResults(searchTerm)}
                autoComplete="off"
              />
            </form>

            {showDropdown && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                {isLoadingSearch && (
                  <div className="p-4 text-sm text-gray-500 text-center">Mencari...</div>
                )}
                {!isLoadingSearch && searchResults.length > 0 && (
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map((koperasi) => (
                      <li
                        key={koperasi.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer text-left"
                        onClick={() => redirectToSubdomain(koperasi.subdomain)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <p className="font-semibold text-gray-800">{koperasi.nama}</p>
                        <p className="text-xs text-blue-600">
                          {koperasi.subdomain}.sistemkoperasi.id 
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {!isLoadingSearch && searchResults.length === 0 && searchTerm.trim() !== "" && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Koperasi tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>
          )}
          {/* CTA BUTTONS (Tidak berubah) */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Daftar Anggota
              </Button>
            </Link>
            <Link href="/berita" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/20 border-white text-white hover:bg-white/30 focus:ring-white/50"
              >
                Lihat Berita
              </Button>
            </Link>
          </div>
        </div>
      </section>

    
      {/* SEJARAH (DIMODIFIKASI) */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-80 lg:h-full rounded-2xl overflow-hidden shadow-lg">
              {/* --- MODIFIKASI: Gunakan gambar dinamis dari settings --- */}
              <Image
                src={platformSettings.section2ImageUrl || "https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg"} // Fallback ke gambar statis
                alt={platformSettings.section2Title || "Tentang Koperasi Merah Putih"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              {/* --- MODIFIKASI: Gunakan judul dinamis dari settings --- */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">
                {platformSettings.section2Title || "Membangun Ekonomi Kerakyatan Berbasis Gotong Royong"}
              </h2>
              {/* --- MODIFIKASI: Gunakan subjudul dinamis dari settings --- */}
              <p className="text-gray-700 leading-relaxed">
                {platformSettings.section2Subtitle || "Koperasi Desa/Kelurahan Merah Putih dibentuk berdasarkan semangat Pasal 33 UUD 1945..."}
              </p>
              {/* --- MODIFIKASI: Masukkan data quotes ke QuoteFader --- */}
              <QuoteFader 
                quotesJsonString={quotesJsonStringForFader} 
                isMainDomain={isMainDomain} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* FITUR (Tidak berubah) */}
      <section className="py-12 md:py-16 bg-gray-50 border-y">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-brand-red-600">Simpanan</h3>
            <p className="mt-2 text-gray-600">
              Pantau saldo dan histori simpanan dengan transparan.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-brand-red-600">Pinjaman</h3>
            <p className="mt-2 text-gray-600">
              Ajukan pinjaman online, proses cepat dan terukur.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-brand-red-600">Katalog</h3>
            <p className="mt-2 text-gray-600">
              Jelajahi produk/jasa koperasi untuk anggota dan publik.
            </p>
          </div>
        </div>
      </section>

      {/* --- [DIMODIFIKASI] GALERI --- */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-red-600">Galeri Kegiatan</h2>
              <p className="text-gray-600 mt-1">Cuplikan momen terbaik dari kegiatan kami.</p>
            </div>
            <Link href="/galeri" className="hidden sm:inline-block">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          
          {/* --- [MODIFIKASI] Logika Loading Galeri --- */}
          {dataLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="mb-4 break-inside-avoid">
                  {/* Skeleton untuk galeri */}
                  <div className={clsx(
                    "w-full h-auto rounded-xl shadow",
                    // Aspect ratio acak untuk masonry layout
                    i % 3 === 0 ? "h-64" : (i % 3 === 1 ? "h-80" : "h-72"),
                    "animate-pulse bg-gray-200"
                  )} />
                </div>
              ))}
            </div>
          ) : galleryImages.length > 0 ? (
            // Gunakan state 'galleryImages', bukan GALLERY_IMAGES
            <Gallery images={galleryImages} limit={6} />
          ) : (
            <p className="text-center text-gray-500">
              Belum ada galeri yang diunggah.
            </p>
          )}
          {/* --- [AKHIR MODIFIKASI] --- */}

        </div>
      </section>

      {/* --- BERITA TERKINI (Kode Anda sudah benar) --- */}
      <section className="py-12 md:py-16 bg-red-50/50 border-t">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-red-600">Berita Terkini</h2>
              <p className="text-gray-600 mt-1">
                Update terbaru seputar kegiatan dan layanan koperasi.
              </p>
            </div>
            <Link href="/berita" className="hidden sm:inline-block">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {dataLoading ? (
              <>
                <SkeletonNewsCard />
                <SkeletonNewsCard />
                <SkeletonNewsCard />
              </>
            ) : latest.length > 0 ? (
              latest.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))
            ) : (
              <p className="md:col-span-3 text-center text-gray-500">
                Belum ada berita yang dipublikasikan.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- PRODUK UNGGULAN (Kode Anda sudah benar) --- */}
      <section className="py-12 md:py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-red-600">Produk Unggulan</h2>
              <p className="text-gray-600 mt-1">Jelajahi produk dan layanan terbaik kami.</p>
            </div>
            <Link href="/katalog" className="hidden sm:inline-block">
              <Button variant="outline">Lihat Semua Produk</Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dataLoading ? (
              <>
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
              </>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((itemProduk) => (
                <ProductCard key={itemProduk.id} produk={itemProduk} />
              ))
            ) : (
              <p className="sm:col-span-2 lg:col-span-4 text-center text-gray-500">
                Belum ada produk unggulan yang tersedia saat ini.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA (Tidak berubah) */}
      <section className="bg-slate-100 border-y">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">
                Mari Bangun Negeri Dengan Jadi Bagian Dari Koperasi
              </h2>
              <p className="mt-4 text-gray-600 max-w-lg mx-auto md:mx-0">
                Wujudkan Koperasi Modern yang transparan, efisien, dan mensejahterakan Anggota.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Link href="/auth/daftar-koperasi">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Daftarkan Koperasi Anda
                  </Button>
                </Link>
                <Link href="/auth/daftar-anggota">
                  <Button className="w-full sm:w-auto">
                    Bergabung Menjadi Anggota Koperasi
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden h-[350px] w-full md:flex justify-center items-end">
              <Image
                src="/images/merahputih-rmv.png"
                alt="Anak-anak Indonesia membawa bendera"
                fill
                style={{ objectFit: "contain" }}
                className="rounded-lg"
              />
              <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// --- Komponen Skeleton untuk Loading Card (Tidak berubah) ---

const SkeletonNewsCard = () => (
  <article className="rounded-2xl border border-red-100 bg-white shadow overflow-hidden">
    <div className="relative w-full aspect-[16/9] bg-gray-200 animate-pulse" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
      <div className="h-5 bg-gray-200 rounded w-5/6 mb-1 animate-pulse" />
      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-full mt-3 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mt-1 animate-pulse" />
    </div>
  </article>
);

const SkeletonProductCard = () => (
  <article className="rounded-2xl border border-red-100 bg-white shadow overflow-hidden">
    <div className="relative w-full aspect-square bg-gray-200 animate-pulse" />
    <div className="p-4">
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
    </div>
  </article>
);