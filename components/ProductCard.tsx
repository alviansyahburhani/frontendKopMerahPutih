// Lokasi: frontend/components/ProductCard.tsx
import Image from "next/image";
import { Tag } from "lucide-react";

// Tipe data Produk (bisa diimpor dari file terpisah nanti)
type Produk = {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  status: "Tersedia" | "Habis";
  imageUrl?: string;
};

export default function ProductCard({ produk }: { produk: Produk }) {
  const imageSrc = produk.imageUrl && produk.imageUrl.trim().length > 0
    ? produk.imageUrl
    : "/images/merahputih-rmv.png";
  const kategori =
    typeof produk.kategori === "string" && produk.kategori.trim().length > 0
      ? produk.kategori
      : "Tanpa kategori";
  const isService = kategori.toLowerCase() === "jasa";

  return (
    <article className="rounded-2xl border border-red-100 bg-white shadow hover:shadow-lg transition overflow-hidden">
      {/* Nanti bisa dibuat link ke detail produk jika ada */}
      {/* <Link href={`/katalog/${produk.id}`} className="block"> */}
        <div className="relative w-full aspect-square"> {/* Ubah aspect ratio jika perlu */}
          <Image
            src={imageSrc}
            alt={produk.nama}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
           <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
              produk.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
           }`}>
              {produk.status}
           </span>
        </div>
        <div className="p-4">
           <p className="text-xs text-gray-500 flex items-center gap-1"><Tag size={12}/> {kategori}</p>
          <h3 className="text-md font-bold text-gray-800 mt-1 line-clamp-2">{produk.nama}</h3>
          <p className="text-lg font-extrabold text-brand-red-600 mt-2">
            {isService
              ? `Biaya Admin: Rp${produk.harga.toLocaleString('id-ID')}`
              : `Rp${produk.harga.toLocaleString('id-ID')}`}
          </p>
        </div>
      {/* </Link> */}
    </article>
  );
}
