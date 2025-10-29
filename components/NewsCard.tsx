import Image from "next/image";
import Link from "next/link";
import { NewsItem } from "./public/NewsTypes";

export default function NewsCard({ item }: { item: NewsItem }) {
  const date = new Date(item.publishedAt).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
  return (
    <article className="rounded-2xl border border-red-100 bg-white shadow hover:shadow-lg transition overflow-hidden">
      <Link href={`/berita/${item.slug}`} className="block">
        <div className="relative w-full aspect-[16/9]">
          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 33vw" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-brand-red-600 line-clamp-2">{item.title}</h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>
          <p className="mt-3 text-xs text-brand-red-700">{date}</p>
        </div>
      </Link>
    </article>
  );
}
