// Lokasi: components/MainDomainFeatures.tsx
'use client';

import { 
  BookUser, 
  PiggyBank, 
  HandCoins, 
  ClipboardList,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Tipe data untuk satu fitur
interface FeatureItem {
  title: string | null;
  description: string | null;
  href: string;
  icon: React.ElementType;
}

// Tipe untuk props komponen utama
interface MainDomainFeaturesProps {
  title: string | null;
  subtitle: string | null;
  features: FeatureItem[];
}

// Komponen Card kecil
const FeatureCard = ({ item }: { item: FeatureItem }) => {
  const Icon = item.icon;
  return (
    <Link href={item.href}>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full
                      transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="p-3 bg-brand-red-100 rounded-full w-12 h-12 inline-flex items-center justify-center">
          <Icon className="w-6 h-6 text-brand-red-700" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">
          {item.title || "Fitur Unggulan"}
        </h3>
        <p className="mt-2 text-gray-600">
          {item.description || "Deskripsi fitur akan segera hadir."}
        </p>
        <div className="mt-4 text-brand-red-600 font-semibold flex items-center group">
          Pelajari lebih lanjut
          <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

// Komponen Utama
export default function MainDomainFeatures({ title, subtitle, features }: MainDomainFeaturesProps) {
  return (
    <section className="py-16 md:py-24 bg-gray-50 border-y">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">
            {title || "Dibangun Sesuai Standar 16 Buku Administrasi"}
          </h2>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            {subtitle || "Platform kami dirancang untuk digitalisasi lengkap alur kerja koperasi, memastikan kepatuhan dan transparansi data."}
          </p>
        </div>

        {/* Grid Fitur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <FeatureCard key={index} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}

// Helper untuk memetakan string ikon ke komponen
export const getIconForFeature = (iconName: string): React.ElementType => {
  switch (iconName) {
    case 'BookUser': return BookUser;
    case 'PiggyBank': return PiggyBank;
    case 'HandCoins': return HandCoins;
    case 'ClipboardList': return ClipboardList;
    default: return ClipboardList; // Default icon
  }
};