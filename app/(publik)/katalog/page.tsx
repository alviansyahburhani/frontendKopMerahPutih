import type { ComponentProps } from "react";
import { headers } from "next/headers";

import ProductCard from "@/components/ProductCard";
import {
  publicService,
  type PaginatedProductsResult,
  type Product as PublicProduct,
} from "@/services/public.service";

type ProductCardData = ComponentProps<typeof ProductCard>["produk"];

const mapProductToCardData = (product: PublicProduct): ProductCardData => {
  const name = product.name?.trim() ?? "Produk Koperasi";
  const price = Number.isFinite(product.price) ? product.price : Number(product.price) || 0;
  const category = product.category?.name?.trim() ?? "Tanpa kategori";
  const imageUrl = product.imageUrl?.trim() || undefined;
  const isAvailable = product.isAvailable !== false;

  return {
    id: product.id,
    nama: name,
    kategori: category,
    harga: price,
    status: isAvailable ? "Tersedia" : "Habis",
    imageUrl,
  };
};

export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  let products: ProductCardData[] = [];
  let errorMessage: string | null = null;

  try {
    const headerList = await headers();
    const host =
      headerList.get("x-forwarded-host") ??
      headerList.get("host") ??
      "localhost:3000";

    const response: PaginatedProductsResult =
      await publicService.getPublishedProducts(1, 60, host);

    products = response.data.map(mapProductToCardData);
  } catch (error) {
    console.error("Gagal memuat katalog publik:", error);
    errorMessage = "Maaf, katalog belum dapat dimuat. Silakan coba lagi nanti.";
  }

  const hasProducts = products.length > 0;
  const messageClass = errorMessage ? "text-red-600" : "text-gray-500";
  const messageText =
    errorMessage ?? "Belum ada produk yang dapat ditampilkan saat ini.";

  return (
    <section className="section">
      <div className="container">
        <h1 className="text-2xl font-bold text-brand-red-700">Katalog</h1>
        <p className="mt-2 text-gray-600">Produk dan jasa koperasi.</p>

        {hasProducts ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} produk={product} />
            ))}
          </div>
        ) : (
          <p className={`mt-8 text-sm ${messageClass}`}>{messageText}</p>
        )}
      </div>
    </section>
  );
}
