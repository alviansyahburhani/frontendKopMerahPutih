"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import Gallery, { GALLERY_IMAGES } from "@/components/Gallery";
import Link from "next/link";
import { NewsItem } from "@/components/NewsTypes";
import NewsCard from "@/components/NewsCard";
import QuoteFader from "@/components/QuoteFader";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";

import { fetchLatest } from "@/lib/news";
import { fetchFeaturedProducts } from "@/lib/products";

/* =========================
   TIPE DATA & UTIL (tanpa any)
   ========================= */

// Hasil search koperasi
type KoperasiSearchResult = {
  id: string;
  nama: string;
  subdomain: string;
};

// Union yang diharapkan ProductCard
type ProdukKategori = "Sembako" | "Elektronik" | "Jasa" | "Lainnya";
type ProdukStatus = "Tersedia" | "Habis";

// Tipe final yang dipakai ProductCard
export type Produk = {
  id: string;
  nama: string;
  harga: number;
  imageUrl: string;
  kategori: ProdukKategori;
  status: ProdukStatus;
};

// Tipe "mentah" dari API (longgar, TANPA any)
type RawProduct = {
  id?: string | number;
  nama?: string;
  title?: string;
  harga?: number | string;
  price?: number | string;
  imageUrl?: string;
  gambar?: string;
  kategori?: unknown;
  status?: unknown;
};

// Type guard: memastikan array RawProduct
function isRawProductArray(x: unknown): x is RawProduct[] {
  return Array.isArray(x);
}

// Helper normalisasi ke union
const toKategori = (val: unknown): ProdukKategori => {
  return val === "Sembako" || val === "Elektronik" || val === "Jasa"
    ? val
    : "Lainnya";
};

const toStatus = (val: unknown): ProdukStatus => {
  return val === "Habis" ? "Habis" : "Tersedia";
};

const toStringSafe = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;

const toNumberSafe = (v: unknown, fallback = 0): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

/* =========================
   KOMPONEN HALAMAN
   ========================= */
export default function Home() {
  // Data awal
  const [latest, setLatest] = useState<NewsItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Produk[]>([]);

  // Search interaktif
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<KoperasiSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  // Ambil data awal
  useEffect(() => {
    const loadData = async () => {
      try {
        const newsData = await fetchLatest(3);
        const raw = (await fetchFeaturedProducts(4)) as unknown;

        // Validasi & mapping ke Produk (tanpa any)
        const productData: Produk[] = isRawProductArray(raw)
          ? raw.map((p): Produk => {
              const id = toStringSafe(p.id, crypto.randomUUID());
              const nama = toStringSafe(p.nama ?? p.title ?? "Produk");
              const harga = toNumberSafe(p.harga ?? p.price ?? 0, 0);
              const imageUrl = toStringSafe(
                p.imageUrl ?? p.gambar ?? "/images/placeholder.png",
                "/images/placeholder.png"
              );
              const kategori = toKategori(p.kategori);
              const status = toStatus(p.status);

              return { id, nama, harga, imageUrl, kategori, status };
            })
          : [];

        setLatest(newsData);
        setFeaturedProducts(productData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Gagal mengambil data awal:", err.message);
        } else {
          console.error("Gagal mengambil data awal:", "Terjadi error tidak dikenal");
        }
      }
    };
    loadData();

    // Cleanup debounce
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

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
      // Mock sementara
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

  // Redirect subdomain (dev vs prod)
  const redirectToSubdomain = (subdomain: string) => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost";
      const protocol = window.location.protocol;
      const rootDomain = isLocal ? "localhost:3000" : "sistemkoperasi.id";
      window.location.href = isLocal
        ? `${protocol}//${rootDomain}/${subdomain}`
        : `${protocol}//${subdomain}.${rootDomain}`;
    }
  };

  // Tutup dropdown saat klik di luar
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
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <Image
          src="https://cdn.pixabay.com/photo/2023/05/04/02/24/bali-7969001_1280.jpg"
          alt="Koperasi"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg">
            Koperasi Merah Putih
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md">
            Bersama membangun kesejahteraan anggota melalui simpanan, pinjaman,
            dan layanan koperasi modern.
          </p>

          {/* SEARCH BAR */}
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

          {/* CTA BUTTONS */}
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

      {/* SEJARAH */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-80 lg:h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg"
                alt="Tentang Koperasi Merah Putih"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">
                Membangun Ekonomi Kerakyatan Berbasis Gotong Royong
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Koperasi Desa/Kelurahan Merah Putih dibentuk berdasarkan semangat
                Pasal 33 UUD 1945, sebagai fondasi untuk memperkuat ketahanan
                ekonomi rakyat.
              </p>
              <QuoteFader />
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
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

      {/* GALERI */}
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
          <Gallery images={GALLERY_IMAGES} limit={6} />
        </div>
      </section>

      {/* BERITA TERKINI */}
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
            {latest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* PRODUK UNGGULAN */}
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
            {featuredProducts.map((itemProduk) => (
              <ProductCard key={itemProduk.id} produk={itemProduk} />
            ))}

            {featuredProducts.length === 0 && (
              <p className="sm:col-span-2 lg:col-span-4 text-center text-gray-500">
                Belum ada produk unggulan yang tersedia saat ini.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
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
