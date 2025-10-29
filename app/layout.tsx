import type { Metadata } from "next";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "Koperasi Merah Putih",
  description: "Platform koperasi modern: simpanan, pinjaman, katalog, dan informasi.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Koperasi Merah Putih",
    description: "Platform koperasi modern.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      {/* Body sekarang tidak lagi memiliki flex-col karena layout diatur oleh child layout */}
      <body suppressHydrationWarning>
        {children}
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      </body>
    </html>
  );
}
