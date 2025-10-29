import Gallery, { GALLERY_IMAGES } from "@/components/Gallery";

export default function GaleriPage() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-brand-red-600">Galeri Lengkap</h1>
        <p className="mt-2 text-gray-600">Semua dokumentasi kegiatan koperasi.</p>

        <div className="mt-6">
          <Gallery images={GALLERY_IMAGES} />
        </div>
      </div>
    </section>
  );
}
