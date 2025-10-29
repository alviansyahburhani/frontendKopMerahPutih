// Lokasi: frontend/components/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from 'clsx'; // Pastikan Anda sudah install clsx: npm install clsx

type Props = {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg"; // <-- Prop size ditambahkan di sini
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = "primary",
  size = "md", // <-- Default size adalah 'md'
  className = "",
  ...rest
}: Props) {
  const base = "inline-flex items-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"; // Tambahkan style untuk disabled

  // Definisikan style ukuran
  const sizes = {
    sm: "px-3 py-1 text-xs",       // Ukuran kecil
    md: "px-5 py-3 text-sm",       // Ukuran standar (sebelumnya)
    lg: "px-6 py-4 text-base"      // Ukuran besar
  };

  // Definisikan style varian
  const styles =
    variant === "primary"
      ? "bg-brand-red-600 text-white shadow hover:bg-brand-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-brand-red-500"
      : "border border-brand-red-600 text-brand-red-600 hover:bg-red-50 focus:ring-2 focus:ring-offset-1 focus:ring-brand-red-300";

  return (
    // Gabungkan semua kelas menggunakan clsx
    <button {...rest} className={clsx(base, styles, sizes[size], className)}>
      {children}
    </button>
  );
}