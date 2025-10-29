import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchLatest, fetchNewsBySlug } from "@/lib/news";
import LatestSidebar from "@/components/LatestSidebar";

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  const item = await fetchNewsBySlug(params.slug);
  if (!item) return notFound();

  const latest = await fetchLatest(3);
  const date = new Date(item.publishedAt).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <nav className="text-sm text-gray-500">
            <span className="hover:text-brand-red-600">Beranda</span> / <span className="hover:text-brand-red-600">Warta Koperasi</span>
          </nav>

          <h1 className="mt-2 text-3xl font-extrabold text-brand-red-600">{item.title}</h1>
          <p className="mt-2 text-gray-500">{date}</p>

          <div className="relative w-full aspect-[16/9] mt-4 rounded-xl overflow-hidden border border-red-100">
            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 66vw" />
          </div>

          {/* Render konten aman; idealnya lewat sanitizer dari backend */}
          <div className="prose prose-red max-w-none mt-6"
               dangerouslySetInnerHTML={{ __html: item.content }} />
        </article>

        <div>
          <LatestSidebar items={latest} />
        </div>
      </div>
    </section>
  );
}
