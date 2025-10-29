import { fetchLatest, fetchNewsList } from "@/lib/news";
import NewsCard from "@/components/NewsCard";
import Pagination from "@/components/Pagination";
import LatestSidebar from "@/components/LatestSidebar";

const PAGE_SIZE = 6;

export default async function BeritaIndex({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page ?? "1");
  const { items, total } = await fetchNewsList(page, PAGE_SIZE);
  const latest = await fetchLatest(3);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kiri: daftar berita */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-red-600">Warta Koperasi</h1>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => <NewsCard key={it.id} item={it} />)}
          </div>
          <Pagination total={total} pageSize={PAGE_SIZE} />
        </div>

        {/* Kanan: sidebar */}
        <div className="lg:col-span-1">
          <LatestSidebar items={latest} />
        </div>
      </div>
    </section>
  );
}
