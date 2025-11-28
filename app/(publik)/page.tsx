// Lokasi: app/(publik)/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, useRef, useMemo } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import Gallery from "@/components/Gallery";
import Link from "next/link";
import { NewsItem } from "@/components/NewsTypes";
import NewsCard from "@/components/NewsCard";
import QuoteFader from "@/components/QuoteFader";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";
import clsx from "clsx";

// --- IMPOR IKON ---
import { 
  Layers,       // Untuk Multi-Tenancy
  PiggyBank,    // Untuk Simpan Pinjam
  BookOpen,     // Untuk 16 Buku
  ShieldCheck,  // Untuk Role-Based Access
  Globe,        // Untuk Website Otomatis
  ClipboardList // Default fallback
} from 'lucide-react';

// --- IMPOR KOMPONEN ---
import { publicService } from "@/services/public.service";
import type { News, GalleryItem } from "@/types/api.types";
import type { Product as PublicProduct } from "@/services/public.service";
import { superAdminService } from "@/services/superadmin.service";
import SubdomainFeatures from "@/components/SubdomainFeatures";

// --- IMPOR SLIDERS & STATS ---

import FeaturesSlider from "@/components/FeaturesSlider"; 
import StatsSection, { PlatformStats } from "@/components/StatsSection"; // [UPDATE] Pastikan import ini ada

const MAIN_DOMAINS = ["localhost", "sistemkoperasi.id"];

/* =========================
   TIPE DATA
   ========================= */
type KoperasiSearchResult = { id: string; nama: string; subdomain: string; };
export type Produk = { id: string; nama: string; harga: number; imageUrl: string; kategori: string; status: string; };
type GalleryImage = { src: string; alt: string; };

/* =========================
   HELPER ICON
   ========================= */
const getIconForFeature = (iconName: string) => {
  switch (iconName) {
    case 'Layers': return Layers;
    case 'PiggyBank': return PiggyBank;
    case 'BookOpen': return BookOpen;
    case 'ShieldCheck': return ShieldCheck;
    case 'Globe': return Globe;
    default: return ClipboardList;
  }
};

/* =========================
   KOMPONEN HALAMAN UTAMA
   ========================= */
export default function Home() {
  // --- STATE ---
  const [isCheckingDomain, setIsCheckingDomain] = useState(true);
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({});

  // [UPDATE] State untuk Data Statistik (Social Proof)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  const [latest, setLatest] = useState<NewsItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Produk[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<KoperasiSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  // --- MEMOIZED DATA ---
  const quotesJsonStringForFader = useMemo(() => {
    if (isMainDomain && (platformSettings.section2Quote1Text || platformSettings.section2Quote2Text)) {
      const quotesArray = [];
      if (platformSettings.section2Quote1Text && platformSettings.section2Quote1Author) quotesArray.push({ text: platformSettings.section2Quote1Text, author: platformSettings.section2Quote1Author });
      if (platformSettings.section2Quote2Text && platformSettings.section2Quote2Author) quotesArray.push({ text: platformSettings.section2Quote2Text, author: platformSettings.section2Quote2Author });
      return JSON.stringify(quotesArray);
    }
    return '[]';
  }, [isMainDomain, platformSettings]);

  // Data Fitur Domain Utama
  const mainFeaturesData = useMemo(() => {
    if (!isMainDomain) return [];
    
    return [
      { 
        title: "Multi-Tenancy", 
        description: "Arsitektur sistem terpusat yang memungkinkan pengelolaan ribuan entitas koperasi dengan pemisahan database yang ketat, menjaga privasi dan independensi data.", 
        href: "/fitur/multi-tenancy", 
        icon: Layers 
      },
      { 
        title: "Manajemen Simpan Pinjam", 
        description: "Otomatisasi siklus keuangan mulai dari setoran, perhitungan bunga, hingga angsuran pinjaman secara real-time untuk meminimalisir kesalahan pembukuan.", 
        href: "/fitur/simpan-pinjam", 
        icon: PiggyBank 
      },
      { 
        title: "16 Buku Administrasi", 
        description: "Sistem otomatis menyusun 16 Buku Administrasi Organisasi sesuai regulasi Permenkop, memudahkan proses audit dan persiapan Rapat Anggota Tahunan (RAT).", 
        href: "/fitur/administrasi", 
        icon: BookOpen 
      },
      { 
        title: "Role-Based Access", 
        description: "Pengaturan hak akses bertingkat (Ketua, Teller, Anggota) untuk memastikan pengguna hanya mengakses data sesuai wewenangnya demi mencegah kecurangan.", 
        href: "/fitur/keamanan", 
        icon: ShieldCheck 
      },
      { 
        title: "Website Otomatis", 
        description: "Dapatkan website profil profesional dengan subdomain khusus (nama-koperasi.sistem.id) secara instan sebagai identitas digital resmi koperasi Anda.", 
        href: "/fitur/website", 
        icon: Globe 
      },
    ];
  }, [isMainDomain]);

  // --- INIT ---
  useEffect(() => {
    const loadTenantData = async () => {
      setDataLoading(true);
      try {
        const [newsResult, productResult, galleryResult] = await Promise.all([
          publicService.getPublishedNewsClient(1, 3),
          publicService.getPublishedProductsClient(1, 4),
          publicService.getPublicGalleryClient(1, 6)
        ]);
        setLatest(newsResult.data.map((n: News) => ({ id: n.id, slug: n.slug, title: n.title, excerpt: n.excerpt || '', content: n.content || '', image: n.imageUrl || "/images/merahputih-rmv.png", publishedAt: n.publishedAt || n.createdAt })));
        setFeaturedProducts(productResult.data.map((p: PublicProduct) => ({ id: p.id, nama: p.name, harga: p.price, imageUrl: p.imageUrl || "/images/merahputih-rmv.png", kategori: p.category?.name || 'Lainnya', status: p.isAvailable ? 'Tersedia' : 'Habis' })));
        setGalleryImages(galleryResult.data.map((g: GalleryItem) => ({ src: g.imageUrl, alt: g.description || "Foto Galeri" })));
      } catch (err) { console.error(err); } finally { setDataLoading(false); }
    };

    const loadPlatformData = async () => {
      setDataLoading(true);
      try {
        // Ambil Settings
        const settings = await superAdminService.getPublicPlatformSettings();
        setPlatformSettings(settings);

        // [UPDATE] Ambil Stats Real-time (Social Proof)
        // Pastikan Anda sudah menambahkan method getPlatformStats di superAdminService
        const stats = await superAdminService.getPlatformStats(); 
        setPlatformStats(stats);

      } catch (err) { console.error(err); } finally { setDataLoading(false); }
    };

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isMain = MAIN_DOMAINS.includes(hostname);
      setIsMainDomain(isMain);
      setIsCheckingDomain(false);
      if (isMain) loadPlatformData();
      else loadTenantData();
    }
  }, []);

  // --- SEARCH ---
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    setIsLoadingSearch(true); setShowDropdown(true);
    try { await new Promise((resolve) => setTimeout(resolve, 300)); setSearchResults([{ id: "1", nama: "Koperasi Maju Jaya", subdomain: "majujaya" }, { id: "2", nama: "Koperasi Warga Sejahtera", subdomain: "wargasejahtera" }].filter((k) => k.nama.toLowerCase().includes(query.toLowerCase()))); } 
    catch (err) { console.error(err); setSearchResults([]); } finally { setIsLoadingSearch(false); }
  };
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => { const query = e.target.value; setSearchTerm(query); if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); searchTimeoutRef.current = setTimeout(() => fetchSearchResults(query), 300); };
  const redirectToSubdomain = (subdomain: string) => { if (typeof window !== "undefined") { const isLocal = window.location.hostname === "localhost"; const rootDomain = isLocal ? "localhost:3000" : "sistemkoperasi.id"; window.location.href = isLocal ? `${window.location.protocol}//${rootDomain}/${subdomain}` : `${window.location.protocol}//${subdomain}.${rootDomain}`; } };

  // --- RENDER ---
  if (isCheckingDomain) return <FullPageSkeleton />;

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center text-center text-white bg-gray-900">
        <div className="absolute inset-0 w-full h-full">
            {dataLoading ? <div className="w-full h-full bg-gray-800 animate-pulse" /> : <><Image src={platformSettings.heroImageUrl || "https://cdn.pixabay.com/photo/2023/05/04/02/24/bali-7969001_1280.jpg"} alt="Hero" fill priority className="object-cover opacity-80" /><div className="absolute inset-0 bg-black/50" /></>}
        </div>
        <div className="relative z-10 container px-4 flex flex-col items-center animate-fade-in-up">
          {dataLoading ? <div className="h-10 md:h-16 w-3/4 max-w-2xl bg-gray-500/50 rounded-lg animate-pulse mb-6" /> : <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg">{platformSettings.heroTitle || "Koperasi Merah Putih"}</h1>}
          {dataLoading ? <div className="h-6 md:h-8 w-2/3 max-w-xl bg-gray-500/50 rounded-lg animate-pulse mb-8" /> : <p className="mt-4 text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md">{platformSettings.heroSubtitle || "Bersama membangun kesejahteraan anggota."}</p>}
          
          {isMainDomain && (
            <div ref={searchWrapperRef} className="mt-8 mb-4 max-w-lg w-full relative">
              {dataLoading ? <div className="h-14 w-full bg-white/20 rounded-full animate-pulse border-2 border-transparent" /> : (
                  <>
                  <form className="relative flex w-full"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div><input type="search" placeholder="Cari koperasi terdaftar..." className="block w-full rounded-full border-2 border-transparent bg-white/90 pl-12 pr-6 py-3 text-gray-900 shadow-md focus:border-brand-red-500 focus:ring-brand-red-500" value={searchTerm} onChange={handleSearchChange} autoComplete="off" /></form>
                  {showDropdown && <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-xl border overflow-hidden max-h-60 overflow-y-auto">{searchResults.map((k) => <div key={k.id} className="p-4 hover:bg-gray-50 cursor-pointer text-left text-black" onClick={() => redirectToSubdomain(k.subdomain)}><p className="font-semibold">{k.nama}</p><p className="text-xs text-blue-600">{k.subdomain}.sistemkoperasi.id</p></div>)}</div>}
                  </>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
            {dataLoading ? <><div className="h-12 w-40 bg-brand-red-600/50 rounded-lg animate-pulse" /><div className="h-12 w-40 bg-white/20 rounded-lg animate-pulse" /></> : <><Link href="/auth/login"><Button size="lg">Daftar Anggota</Button></Link>{!isMainDomain && <Link href="/berita"><Button size="lg" variant="outline" className="bg-white/20 border-white text-white">Lihat Berita</Button></Link>}</>}
          </div>
        </div>
      </section>

      {/* SEJARAH SECTION */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-80 lg:h-full rounded-2xl overflow-hidden shadow-lg bg-gray-100">
               {dataLoading ? <div className="w-full h-full bg-gray-200 animate-pulse" /> : <Image src={platformSettings.section2ImageUrl || "https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg"} alt="Tentang" fill className="object-cover" />}
            </div>
            <div className="space-y-6">
              {dataLoading ? <div className="space-y-4"><div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-full bg-gray-100 rounded animate-pulse" /><div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" /></div> : <><h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">{platformSettings.section2Title || "Membangun Ekonomi Kerakyatan"}</h2><p className="text-gray-700 leading-relaxed">{platformSettings.section2Subtitle || "Koperasi adalah soko guru perekonomian Indonesia..."}</p><QuoteFader quotesJsonString={quotesJsonStringForFader} isMainDomain={isMainDomain} /></>}
            </div>
          </div>
        </div>
      </section>

      {/* --- BAGIAN KHUSUS DOMAIN UTAMA --- */}
      {isMainDomain ? (
        <>
            {/* 1. FEATURES SLIDER (TEMASEK STYLE - UPDATED CONTENT) */}
            <FeaturesSlider 
                title={platformSettings.featuresMainTitle}
                subtitle={platformSettings.featuresMainSubtitle}
                features={mainFeaturesData} 
                isLoading={dataLoading}
            />

            {/* 2. [UPDATE] STATS SECTION (SOCIAL PROOF) - MERAH */}
            <StatsSection stats={platformStats} isLoading={dataLoading} />
        </>
      ) : (
        // --- JIKA SUBDOMAIN: TAMPILKAN FITUR TENANT ---
        <SubdomainFeatures />
      )}

      {/* --- SECTIONS KHUSUS SUBDOMAIN (TENANT) --- */}
      {!isMainDomain && (
        <>
            <section className="py-12 bg-white"><div className="container mx-auto px-4"><div className="mb-8 flex justify-between"><div><h2 className="text-3xl font-extrabold text-brand-red-600">Galeri Kegiatan</h2></div><Link href="/galeri" className="hidden sm:inline-block"><Button variant="outline">Lihat Semua</Button></Link></div>{dataLoading ? <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">{[1,2,3].map(i => <div key={i} className="mb-4 w-full h-64 bg-gray-200 rounded-xl animate-pulse break-inside-avoid"/>)}</div> : galleryImages.length > 0 ? <Gallery images={galleryImages} limit={6} /> : <p className="text-center text-gray-500">Belum ada galeri.</p>}</div></section>
            <section className="py-12 bg-red-50/50 border-t"><div className="container mx-auto px-4"><div className="mb-8 flex justify-between"><div><h2 className="text-3xl font-extrabold text-brand-red-600">Berita Terkini</h2></div><Link href="/berita" className="hidden sm:inline-block"><Button variant="outline">Lihat Semua</Button></Link></div><div className="grid gap-6 md:grid-cols-3">{dataLoading ? [1,2,3].map(i => <SkeletonNewsCard key={i}/>) : latest.length > 0 ? latest.map(item => <NewsCard key={item.id} item={item} />) : <div className="md:col-span-3 text-center text-gray-500 py-10 border border-dashed rounded-xl">Belum ada berita.</div>}</div></div></section>
            <section className="py-12 bg-white border-t"><div className="container mx-auto px-4"><div className="mb-8 flex justify-between"><div><h2 className="text-3xl font-extrabold text-brand-red-600">Produk Unggulan</h2></div><Link href="/katalog" className="hidden sm:inline-block"><Button variant="outline">Lihat Semua</Button></Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{dataLoading ? [1,2,3,4].map(i => <SkeletonProductCard key={i}/>) : featuredProducts.length > 0 ? featuredProducts.map(p => <ProductCard key={p.id} produk={p} />) : <div className="col-span-full text-center text-gray-500 py-10 border border-dashed rounded-xl">Belum ada produk.</div>}</div></div></section>
        </>
      )}

      {/* CTA SECTION */}
      <section className="bg-slate-100 border-y">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">Mari Bangun Negeri Dengan Jadi Bagian Dari Koperasi</h2>
              <p className="mt-4 text-gray-600 max-w-lg mx-auto md:mx-0">Wujudkan Koperasi Modern yang transparan, efisien, dan mensejahterakan Anggota.</p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Link href="/auth/daftar-koperasi"><Button variant="outline" className="w-full sm:w-auto">Daftarkan Koperasi Anda</Button></Link>
                <Link href="/auth/daftar-anggota"><Button className="w-full sm:w-auto">Bergabung Menjadi Anggota Koperasi</Button></Link>
              </div>
            </div>
            <div className="relative hidden h-[350px] w-full md:flex justify-center items-end"><Image src="/images/merahputih-rmv.png" alt="Anak Indonesia" fill style={{ objectFit: "contain" }} className="rounded-lg" /><div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent" /></div>
          </div>
        </div>
      </section>
    </>
  );
}

// --- SKELETONS ---
const FullPageSkeleton = () => <div className="w-full bg-white"><div className="relative h-screen w-full bg-gray-900 flex items-center justify-center"><div className="container px-4 flex flex-col items-center w-full max-w-4xl"><div className="h-12 md:h-20 w-3/4 bg-gray-700 rounded-lg animate-pulse mb-6"></div><div className="h-12 md:h-20 w-1/2 bg-gray-700 rounded-lg animate-pulse mb-6"></div><div className="h-6 w-2/3 bg-gray-700/50 rounded animate-pulse mb-2"></div><div className="h-14 w-full max-w-lg bg-gray-800 rounded-full animate-pulse mb-8"></div><div className="flex gap-4"><div className="h-12 w-40 bg-gray-700 rounded-lg animate-pulse"></div><div className="h-12 w-40 bg-gray-700/50 rounded-lg animate-pulse"></div></div></div></div><div className="py-20 container mx-auto px-4"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div className="h-80 w-full bg-gray-200 rounded-2xl animate-pulse"></div><div className="space-y-6"><div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div><div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div></div></div></div><div className="py-12 bg-slate-50"><div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>)}</div></div></div>;
const SkeletonNewsCard = () => <div className="rounded-2xl bg-white border border-gray-100 shadow p-4 space-y-3"><div className="w-full aspect-video bg-gray-200 rounded-lg animate-pulse" /><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /><div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" /></div>;
const SkeletonProductCard = () => <div className="rounded-2xl bg-white border border-gray-100 shadow p-4 space-y-3"><div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" /><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" /><div className="h-4 bg-gray-200 rounded w-full animate-pulse" /></div>;