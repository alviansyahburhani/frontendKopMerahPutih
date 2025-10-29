import Image from "next/image";
import Link from "next/link";
import { NewsItem } from "./NewsTypes";

export default function LatestSidebar({ items }: { items: NewsItem[] }) {
  return (
    <aside className="space-y-3">
      <h3 className="text-base font-bold text-brand-red-700">Berita Terkini</h3>
      {items.map(it => {
        const date = new Date(it.publishedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
        return (
          <Link key={it.id} href={`/berita/${it.slug}`} className="flex gap-3 rounded-xl border border-red-100 bg-white p-3 hover:shadow transition">
            <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden">
              <Image src={it.image} alt={it.title} fill className="object-cover" sizes="64px" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight line-clamp-2">{it.title}</p>
              <p className="text-xs text-gray-500 mt-1">{date}</p>
            </div>
          </Link>
        );
      })}
    </aside>
  );
}
