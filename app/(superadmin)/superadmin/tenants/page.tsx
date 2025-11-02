// app/(superadmin)/superadmin/tenants/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { superAdminService } from '@/services/superadmin.service';
import { Tenant } from '@/types/api.types';
import { parseApiError } from '@/lib/adminApi';

export default function ManajemenKoperasiPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error setiap kali fetch
      const data = await superAdminService.getAllTenants();
      setTenants(data);
    } catch (err) {
      // PERBAIKAN 2: Tangani jika 'message' adalah array
      const apiError = parseApiError(err);
      if (Array.isArray(apiError.message)) {
        setError(apiError.message.join(', '));
      } else {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleDelete = async (tenantId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus koperasi ini secara permanen?')) {
      try {
        await superAdminService.deleteTenant(tenantId);
        alert('Koperasi berhasil dihapus.');
        // Refresh daftar tenant
        fetchTenants(); 
      } catch (err) {
        alert(`Gagal menghapus: ${parseApiError(err).message}`);
      }
    }
  };

  if (loading) {
    return <div>Loading data koperasi...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manajemen Koperasi</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Koperasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subdomain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data koperasi.
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tenant.picName} ({tenant.picEmail})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.subdomain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tenant.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      tenant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(tenant.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={tenant.status === 'PENDING'} // Opsional: jangan hapus jika pending
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}