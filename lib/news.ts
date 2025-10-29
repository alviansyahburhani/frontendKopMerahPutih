import { NewsItem } from "@/components/NewsTypes";

const MOCK: NewsItem[] = [
  {
    id: "1",
    slug: "presiden-resmikan-80000-kopdes",
    title: "Presiden RI Resmikan 80.000 Kopdes Merah Putih",
    excerpt: "Peresmian kelembagaan koperasi desa/kelurahan Merah Putih sebagai langkah memperkuat ketahanan ekonomi rakyat.",
    content:
      "<p>Peresmian dilaksanakan di Klaten, Jawa Tengah... (isi lengkap bisa berupa HTML yang dirender aman).</p>",
    image: "https://cdn.pixabay.com/photo/2017/08/18/11/04/hongkong-2654531_640.jpg",
    publishedAt: "2025-07-21T07:00:00Z",
  },
  {
    id: "2",
    slug: "launching-kopdes-klaten",
    title: "Launching Kopdes Merah Putih di Klaten",
    excerpt: "Peluncuran program koperasi desa/kelurahan di Klaten berlangsung meriah.",
    content: "<p>Rangkaian kegiatan dihadiri unsur pemerintah dan masyarakat...</p>",
    image: "https://cdn.pixabay.com/photo/2019/04/16/18/13/media-4132399_640.jpg",
    publishedAt: "2025-07-21T06:00:00Z",
  },
  {
    id: "3",
    slug: "kembali-ke-pasal-33",
    title: "Momentum Kembali ke Pasal 33 UUD 45",
    excerpt: "Penguatan ekonomi berbasis koperasi sesuai amanat konstitusi.",
    content: "<p>Semangat gotong royong menjadi landasan pembangunan ekonomi...</p>",
    image: "https://cdn.pixabay.com/photo/2017/07/13/20/24/news-2501786_640.jpg",
    publishedAt: "2025-07-21T05:00:00Z",
  },
];

export async function fetchNewsList(page = 1, pageSize = 6): Promise<{items: NewsItem[]; total: number;}> {
  // Ganti ke fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/news?page=${page}&size=${pageSize}`)
  const start = (page - 1) * pageSize;
  const items = MOCK.slice(start, start + pageSize);
  return { items, total: MOCK.length };
}

export async function fetchLatest(limit = 3): Promise<NewsItem[]> {
  return MOCK.slice(0, limit);
}

export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  return MOCK.find(n => n.slug === slug) ?? null;
}
