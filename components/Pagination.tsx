"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ total, pageSize }: { total: number; pageSize: number; }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = Number(params.get("page") ?? "1");
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const go = (p: number) => router.push(`/berita?page=${p}`);

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button onClick={() => go(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-3 py-2 rounded-lg border border-red-200 text-brand-red-600 disabled:opacity-40">
        ‹
      </button>
      {Array.from({ length: pages }).map((_, i) => {
        const p = i + 1;
        return (
          <button key={p} onClick={() => go(p)}
            className={`px-3 py-2 rounded-lg border ${p === current ? "bg-brand-red-600 text-white border-brand-red-600" : "border-red-200 text-brand-red-600 hover:bg-red-50"}`}>
            {p}
          </button>
        );
      })}
      <button onClick={() => go(Math.min(pages, current + 1))}
        disabled={current === pages}
        className="px-3 py-2 rounded-lg border border-red-200 text-brand-red-600 disabled:opacity-40">
        ›
      </button>
    </div>
  );
}
