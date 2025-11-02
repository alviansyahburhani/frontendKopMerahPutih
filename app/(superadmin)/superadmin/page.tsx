// app/(superadmin)/superadmin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { superAdminService } from '@/services/superadmin.service';

// Tipe untuk menampung data statistik
interface Stats {
  totalKoperasi: number;
  koperasiPending: number;
  totalAnggota: string; // Kita beri string karena belum ada datanya
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Panggil kedua API secara bersamaan
        const [allTenants, pendingTenants] = await Promise.all([
          superAdminService.getAllTenants(),
          superAdminService.getPendingTenants(),
        ]);

        setStats({
          totalKoperasi: allTenants.length,
          koperasiPending: pendingTenants.length,
          totalAnggota: 'N/A', // Data belum tersedia dari backend
        });

      } catch (error) {
        console.error('Gagal memuat statistik:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const renderStatCard = (title: string, value: string | number) => {
    return (
      <div className="bg-white shadow-lg rounded-md p-6">
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
        {loading ? (
          <p className="mt-2 text-3xl font-semibold text-gray-900">Loading...</p>
        ) : (
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderStatCard('Total Koperasi', stats?.totalKoperasi ?? 0)}
        {renderStatCard('Koperasi Pending', stats?.koperasiPending ?? 0)}
        {renderStatCard('Total Anggota (Semua Koperasi)', stats?.totalAnggota ?? 'N/A')}
      </div>

      {stats?.totalAnggota === 'N/A' && !loading && (
        <p className="mt-4 text-sm text-gray-500">
           Statistik Total Anggota belum tersedia karena backend belum menyediakan endpoint global untuk ini.
        </p>
      )}
    </div>
  );
}