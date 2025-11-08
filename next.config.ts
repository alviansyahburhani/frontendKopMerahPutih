import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
       hostname: 'koperasi.kirinxe00.workers.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-d1365018603a44b4a560230bd94b56fe.r2.dev',
      },
      // --- DAN JUGA YANG INI (dari error sebelumnya) ---
      {
        protocol: 'https',
        hostname: 'koperasi-dokumen-pendaftaran.e20806dfd4fa71c26e01153f020a638f.r2.cloudflarestorage.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3002/api/v1/:path*', // Proxy ke backend
      },
    ];
  },
};

export default nextConfig;