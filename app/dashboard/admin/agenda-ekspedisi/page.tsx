"use client";

import { useState, useMemo, useEffect, FormEvent, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, ArrowLeftRight, X, Edit, Trash2, XCircle, Loader2 } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast'; 
import { adminService } from '@/services/admin.service';
import { ApiErrorResponse, AgendaExpedition, CreateAgendaExpeditionDto, UpdateAgendaExpeditionDto } from '@/types/api.types';

// Helper format tanggal
const toIndoDate = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
const toYYYYMMDD = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// --- Komponen Skeleton (dari kode Anda) ---
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
);

const AgendaSkeleton = () => (
  // ... (Kode Skeleton Anda tidak perlu diubah) ...
  <div>
    <div className="mb-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mt-2" />
    </div>
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <Skeleton className="h-6 w-1/2 mx-auto text-center" />
      </div>
      <div className="p-6">
        <div className="bg-gray-50 border rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Skeleton className="h-10 w-full" /></div>
          <div><Skeleton className="h-10 w-full" /></div>
          <div><Skeleton className="h-10 w-full" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4"><Skeleton className="h-4 w-12" /></th>
                <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                <th className="p-4"><Skeleton className="h-4 w-32" /></th>
                <th className="p-4"><Skeleton className="h-4 w-28" /></th>
                <th className="p-4"><Skeleton className="h-4 w-20" /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="border-b text-sm">
                  <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="p-4"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// --- [BARU] Modal untuk Tambah & Edit ---
type ModalMode = 'create' | 'edit';
type LetterType = 'LETTER_IN' | 'LETTER_OUT';

const AgendaModal = ({
  mode,
  type,
  data,
  onClose,
  onSuccess,
}: {
  mode: ModalMode;
  type?: LetterType;
  data?: AgendaExpedition | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    // pakai nama field yang sama persis dengan backend
    letterDate: mode === 'edit' ? toYYYYMMDD(data?.letterDate) : '',
    letterNumber: mode === 'edit' ? data?.letterNumber || '' : '',
    addressedTo: mode === 'edit' ? data?.addressedTo || '' : '',
    subject: mode === 'edit' ? data?.subject || '' : '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const title =
    mode === 'create'
      ? type === 'LETTER_IN'
        ? 'Catat Surat Masuk'
        : 'Catat Surat Keluar'
      : 'Edit Entri Surat';

  const originLabel =
    type === 'LETTER_IN' || data?.type === 'LETTER_IN'
      ? 'Asal Surat *'
      : 'Tujuan Surat *';

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    let promise;

    if (mode === 'create' && type) {
      // KIRIM HANYA FIELD YANG DITERIMA BACKEND
      const createDto: CreateAgendaExpeditionDto = {
        letterDate: formData.letterDate,
        letterNumber: formData.letterNumber,
        addressedTo: formData.addressedTo,
        subject: formData.subject,
        type: type,
      };
      promise = adminService.createAgendaExpedition(createDto);
    } else if (mode === 'edit' && data) {
      const updateDto: UpdateAgendaExpeditionDto = {
        letterDate: formData.letterDate,
        letterNumber: formData.letterNumber,
        addressedTo: formData.addressedTo,
        subject: formData.subject,
        // notes TIDAK dikirim
      };
      promise = adminService.updateAgendaExpedition(data.id, updateDto);
    } else {
      toast.error('Terjadi kesalahan pada form.');
      setIsLoading(false);
      return;
    }

    toast.promise(promise, {
      loading: 'Menyimpan data...',
      success: () => {
        setIsLoading(false);
        onSuccess();
        onClose();
        return `Data surat berhasil ${
          mode === 'create' ? 'dibuat' : 'diperbarui'
        }.`;
      },
      error: (err) => {
        setIsLoading(false);
        const apiError = err as ApiErrorResponse;
        return Array.isArray(apiError.message)
          ? `Gagal: ${apiError.message.join(', ')}`
          : `Gagal: ${apiError.message}`;
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <XCircle size={24} />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="letterDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tanggal Surat *
                </label>
                <input
                  type="date"
                  name="letterDate"
                  id="letterDate"
                  value={formData.letterDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="letterNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nomor Surat *
                </label>
                <input
                  type="text"
                  name="letterNumber"
                  id="letterNumber"
                  value={formData.letterNumber}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="addressedTo"
                className="block text-sm font-medium text-gray-700"
              >
                {originLabel}
              </label>
              <input
                type="text"
                name="addressedTo"
                id="addressedTo"
                value={formData.addressedTo}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Perihal *
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            {/* TIDAK ADA TEXTAREA LAGI */}
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Simpan Data'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Komponen Utama Halaman ---
export default function AgendaEkspedisiPage() {
  const [filters, setFilters] = useState({
    search: '',
    jenis: '', 
  });
  const [suratList, setSuratList] = useState<AgendaExpedition[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [modalType, setModalType] = useState<LetterType | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = useState<AgendaExpedition | null>(null);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const dataFromApi = await adminService.getAgendaExpeditions();
      setSuratList(dataFromApi.sort((a, b) => b.mailSequenceNumber - a.mailSequenceNumber));
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal memuat data: ${message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadEntries();
  }, []); 

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', jenis: '' });
  };

  const filteredSurat = useMemo(() => {
    return suratList.filter(entry => {
      const searchTerm = filters.search.toLowerCase();
      return (
        (entry.subject.toLowerCase().includes(searchTerm) || 
         entry.addressedTo.toLowerCase().includes(searchTerm) || 
         entry.letterNumber.toLowerCase().includes(searchTerm)) &&
        (filters.jenis === '' || entry.type === filters.jenis)
      );
    });
  }, [filters, suratList]);

  const handleDelete = (id: string, noSurat: string) => {
    if (!window.confirm(`Yakin ingin menghapus surat no. "${noSurat}"? Data tidak dapat dikembalikan.`)) return;

    const promise = adminService.deleteAgendaExpedition(id);

    toast.promise(promise, {
      loading: 'Menghapus surat...',
      success: () => {
        setSuratList((prevList) =>
          prevList.filter((entry) => entry.id !== id)
        );
        return 'Surat berhasil dihapus.';
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        return `Gagal menghapus: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      },
    });
  };

  const openCreateModal = (type: LetterType) => {
    setModalMode('create');
    setModalType(type);
    setSelectedEntry(null);
  };

  const openEditModal = (entry: AgendaExpedition) => {
    setModalMode('edit');
    setSelectedEntry(entry);
    setModalType(undefined);
  };
  
  const closeModal = () => {
    setModalMode(null);
    setSelectedEntry(null);
  };

  if (loading) {
    return <AgendaSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <AdminPageHeader
        title="Buku Agenda & Ekspedisi"
        description="Kelola dan arsipkan semua surat masuk dan surat keluar koperasi."
        actionButton={
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => openCreateModal('LETTER_IN')}>
                    <PlusCircle size={20} /><span>Catat Surat Masuk</span>
                </Button>
                <Button variant="primary" onClick={() => openCreateModal('LETTER_OUT')}>
                    <PlusCircle size={20} /><span>Catat Surat Keluar</span>
                </Button>
            </div>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Agenda & Ekspedisi
          </h2>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Riwayat Surat</h2>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Surat</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="No. Surat, Perihal, Asal/Tujuan..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Surat</label>
              <select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg bg-white">
                <option value="">Semua</option>
                <option value="LETTER_IN">Masuk</option>
                <option value="LETTER_OUT">Keluar</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">No. Urut</th>
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">No. Surat</th>
                  <th className="p-4 font-medium">Perihal</th>
                  <th className="p-4 font-medium">Asal / Tujuan</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurat.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50 text-sm transition-colors duration-150">
                    <td className="p-4 font-mono text-center">{entry.mailSequenceNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-full ${entry.type === 'LETTER_IN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                          <ArrowLeftRight size={14} />
                        </span>
                        <span>{toIndoDate(entry.letterDate)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{entry.letterNumber}</td>
                    <td className="p-4 font-medium text-gray-800">{entry.subject}</td>
                    <td className="p-4">{entry.addressedTo}</td>
                    <td className="p-4 text-center space-x-2">
                        <Button onClick={() => openEditModal(entry)} variant="outline" size="sm" className="text-xs px-2 py-1">
                          <Edit size={14} />
                        </Button>
                        <Button onClick={() => handleDelete(entry.id, entry.letterNumber)} variant="outline" size="sm" className="text-xs px-2 py-1 text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                    </td>
                  </tr>
                ))}
                {filteredSurat.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      Tidak ada data surat yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalMode && (
        <AgendaModal
          mode={modalMode}
          type={modalType}
          data={selectedEntry}
          onClose={closeModal}
          onSuccess={() => {
            loadEntries(); // Panggil fungsi refresh
          }}
        />
      )}
    </div>
  );
}