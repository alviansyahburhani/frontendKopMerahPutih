"use client";

import { useState, useMemo, FormEvent, useEffect, useCallback, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, XCircle, Edit, Trash2, UserPlus } from "lucide-react"; // Tambahkan UserPlus
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
// --- Impor service & tipe yang relevan ---
import {
  adminService,
  BoardMember, // Tipe untuk data pengurus
  CreateBoardMemberDto, // Tipe untuk menambah pengurus
  UpdateBoardMemberDto, // Tipe untuk edit pengurus
  MemberSearchResult, // Tipe hasil pencarian anggota untuk modal tambah
  TenantInfo
} from '@/services/admin.service';
import { ApiErrorResponse } from "@/types/api.types";
import { Gender } from "@/types/enums"; // Mungkin perlu untuk detail


// ===================================================================
// KOMPONEN MODAL UNTUK TAMBAH PENGURUS
// ===================================================================
const TambahPengurusModal = ({
  isOpen,
  onClose,
  onPengurusAdded
}: {
  isOpen: boolean;
  onClose: () => void;
  onPengurusAdded: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberSearchResult | null>(null);
  const [jabatan, setJabatan] = useState<'Ketua' | 'Sekretaris' | 'Bendahara'>('Ketua'); // Default Ketua
  const [tanggalDiangkat, setTanggalDiangkat] = useState('');

  const resetFormState = () => {
    setSelectedMember(null);
    setJabatan('Ketua');
    setTanggalDiangkat('');
  };

  useEffect(() => {
    if (isOpen) {
      resetFormState(); // Reset state saat modal dibuka
    }
  }, [isOpen]);

  // Fungsi untuk load options di AsyncSelect
  const loadMemberOptions = async (inputValue: string): Promise<MemberSearchResult[]> => {
    if (!inputValue || inputValue.length < 3) { // Hanya cari jika minimal 3 karakter
      return [];
    }
    try {
      // Panggil API searchMembers (asumsi ada di adminService)
      const results = await adminService.searchMembers(inputValue);
      return results;
    } catch (error) {
      console.error("Gagal mencari anggota:", error);
      toast.error("Gagal mencari anggota.");
      return [];
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMember) {
      toast.error("Silakan pilih anggota terlebih dahulu.");
      return;
    }
    if (!tanggalDiangkat) {
        toast.error("Tanggal diangkat wajib diisi.");
        return;
    }

    setLoading(true);

    const dto: CreateBoardMemberDto = {
      memberId: selectedMember.id,
      jabatan: jabatan,
      tanggalDiangkat: tanggalDiangkat, // Format YYYY-MM-DD
    };

    const promise = adminService.createBoardMember(dto);

    toast.promise(promise, {
      loading: 'Menyimpan jabatan pengurus baru...',
      success: (result) => {
        setLoading(false);
        onPengurusAdded();
        onClose();
        return `Anggota "${selectedMember.fullName}" berhasil diangkat sebagai ${result.jabatan}!`;
      },
      error: (err) => {
        setLoading(false);
        const apiError = err as ApiErrorResponse;
        return `Gagal menambahkan pengurus: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Tambah Jabatan Pengurus</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="cariAnggota" className="block text-sm font-medium text-gray-700 mb-1">Cari & Pilih Anggota*</label>
            <AsyncSelect
              id="cariAnggota"
              cacheOptions
              defaultOptions // Muat opsi default jika perlu (misal: pengurus terakhir)
              loadOptions={loadMemberOptions}
              getOptionLabel={(option) => `${option.fullName} (NIK: ${option.nik})`} // Tampilan opsi
              getOptionValue={(option) => option.id} // Nilai unik opsi
              onChange={(option) => setSelectedMember(option as MemberSearchResult)}
              placeholder="Ketik nama atau NIK (min. 3 huruf)..."
              noOptionsMessage={({ inputValue }) =>
                inputValue.length < 3 ? "Ketik minimal 3 huruf" : "Anggota tidak ditemukan"
              }
              value={selectedMember} // Tampilkan member yang dipilih
              isDisabled={loading}
              isClearable
            />
             {selectedMember && (
                <p className="text-xs text-green-600 mt-1">Terpilih: {selectedMember.fullName}</p>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan*</label>
              <select
                name="jabatan"
                id="jabatan"
                required
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value as 'Ketua' | 'Sekretaris' | 'Bendahara')}
                className="mt-1 w-full p-2 border rounded-md bg-white"
                disabled={loading}
              >
                <option value="Ketua">Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                {/* Tambahkan opsi lain jika Enum JabatanPengurus di backend bertambah */}
              </select>
            </div>
            <div>
              <label htmlFor="tanggalDiangkat" className="block text-sm font-medium text-gray-700">Tanggal Diangkat*</label>
              <input
                type="date"
                name="tanggalDiangkat"
                id="tanggalDiangkat"
                required
                value={tanggalDiangkat}
                onChange={(e) => setTanggalDiangkat(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Jabatan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ===================================================================
// KOMPONEN MODAL UNTUK EDIT PENGURUS
// ===================================================================
const EditPengurusModal = ({
  isOpen,
  pengurus,
  onClose,
  onPengurusUpdated
}: {
  isOpen: boolean;
  pengurus: BoardMember | null;
  onClose: () => void;
  onPengurusUpdated: () => void;
}) => {
  const [formData, setFormData] = useState<BoardMember | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pengurus) {
      // Format tanggal untuk input type="date"
      setFormData({
        ...pengurus,
        tanggalDiangkat: pengurus.tanggalDiangkat ? new Date(pengurus.tanggalDiangkat).toISOString().split('T')[0] : '',
        tanggalBerhenti: pengurus.tanggalBerhenti ? new Date(pengurus.tanggalBerhenti).toISOString().split('T')[0] : null, // Jaga agar bisa null
      });
    } else {
      setFormData(null);
    }
  }, [pengurus]);

   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    // Jika tanggal berhenti dikosongkan, reset juga alasan berhenti
    if (name === 'tanggalBerhenti' && value === '') {
        setFormData(prev => ({ ...prev!, [name]: null, alasanBerhenti: null }));
    } else {
        setFormData(prev => ({ ...prev!, [name]: value }));
    }
  };


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;
    setLoading(true);

    const updateDto: UpdateBoardMemberDto = {
      jabatan: formData.jabatan,
      tanggalDiangkat: formData.tanggalDiangkat, // Sudah format YYYY-MM-DD
      tanggalBerhenti: formData.tanggalBerhenti || null, // Kirim null jika kosong
      alasanBerhenti: formData.tanggalBerhenti ? (formData.alasanBerhenti || '') : null, // Kirim alasan hanya jika ada tanggal berhenti
    };

    const promise = adminService.updateBoardMember(formData.id, updateDto);

    toast.promise(promise, {
      loading: 'Memperbarui data pengurus...',
      success: (result) => {
        setLoading(false);
        onPengurusUpdated();
        onClose();
        return `Data jabatan ${result.jabatan} untuk "${result.member.fullName}" berhasil diperbarui!`;
      },
      error: (err) => {
        setLoading(false);
        const apiError = err as ApiErrorResponse;
        return `Gagal memperbarui: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      }
    });
  };

  if (!isOpen || !formData) return null;

  return (
     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Jabatan Pengurus</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
           {/* Tampilkan Nama Anggota (tidak bisa diedit) */}
            <div>
              <label className="block text-sm font-medium text-gray-500">Nama Anggota</label>
              <p className="mt-1 text-base font-semibold text-gray-800">{formData.member.fullName}</p>
            </div>

          {/* Edit Jabatan & Tanggal Diangkat */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jabatanEdit" className="block text-sm font-medium text-gray-700">Jabatan*</label>
              <select
                name="jabatan"
                id="jabatanEdit"
                required
                value={formData.jabatan}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md bg-white"
                disabled={loading}
              >
                <option value="Ketua">Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
              </select>
            </div>
            <div>
              <label htmlFor="tanggalDiangkatEdit" className="block text-sm font-medium text-gray-700">Tanggal Diangkat*</label>
              <input
                type="date"
                name="tanggalDiangkat"
                id="tanggalDiangkatEdit"
                required
                value={formData.tanggalDiangkat}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                disabled={loading}
              />
            </div>
          </div>

          {/* Edit Tanggal & Alasan Berhenti */}
           <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label htmlFor="tanggalBerhentiEdit" className="block text-sm font-medium text-gray-700">Tanggal Berhenti</label>
              <input
                type="date"
                name="tanggalBerhenti"
                id="tanggalBerhentiEdit"
                value={formData.tanggalBerhenti || ''} // Tampilkan string kosong jika null
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                disabled={loading}
              />
            </div>
            {/* Hanya aktifkan alasan jika tanggal berhenti diisi */}
            <div className="md:col-span-2">
              <label htmlFor="alasanBerhentiEdit" className="block text-sm font-medium text-gray-700">Alasan Berhenti</label>
              <textarea
                name="alasanBerhenti"
                id="alasanBerhentiEdit"
                rows={2}
                value={formData.alasanBerhenti || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                disabled={loading || !formData.tanggalBerhenti} // Disable jika tanggal berhenti kosong
                placeholder={!formData.tanggalBerhenti ? '(Isi tanggal berhenti terlebih dahulu)' : ''}
              />
            </div>
           </div>

          {/* Footer Modal */}
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL DETAIL PENGURUS
// ===================================================================
const DetailPengurusModal = ({
    isOpen,
    pengurus,
    onClose
  }: {
    isOpen: boolean;
    pengurus: BoardMember | null;
    onClose: () => void;
  }) => {
    if (!isOpen || !pengurus) return null;

    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const dataJabatan = [
      { label: "Jabatan", value: pengurus.jabatan },
      { label: "Tanggal Diangkat", value: formatDate(pengurus.tanggalDiangkat) },
      { label: "Status Jabatan", value: pengurus.tanggalBerhenti ? `Berhenti (${formatDate(pengurus.tanggalBerhenti)})` : "Aktif" },
    ];
    if (pengurus.tanggalBerhenti) {
        dataJabatan.push({ label: "Alasan Berhenti", value: pengurus.alasanBerhenti || "-" });
    }

    const dataPribadi = [
        { label: "Nama Lengkap", value: pengurus.member.fullName },
        { label: "Nomor Anggota", value: pengurus.member.memberNumber || "-" },
        { label: "Pekerjaan", value: pengurus.member.occupation || "-" },
        { label: "Alamat", value: pengurus.member.address || "-" },
        // Tambahkan detail lain dari member jika perlu (NIK, TTL, dll.)
        { label: "Jenis Kelamin", value: pengurus.member.gender ? (pengurus.member.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan') : "-" },
        { label: "Tempat, Tgl Lahir", value: pengurus.member.placeOfBirth && pengurus.member.dateOfBirth ? `${pengurus.member.placeOfBirth}, ${formatDate(pengurus.member.dateOfBirth)}` : "-" },
    ];


    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Detail Pengurus</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-6">
             <div className="border-b pb-4">
                <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Jabatan</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataJabatan.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5 break-words">{item.value}</dd></div>))}</dl>
            </div>
             <div className="border-b pb-4">
                <h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataPribadi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5 break-words">{item.value}</dd></div>))}</dl>
            </div>
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button>
          </div>
        </div>
      </div>
    );
  };

// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function DaftarPengurusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pengurusList, setPengurusList] = useState<BoardMember[]>([]); // State untuk data pengurus
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null); // State info tenant (opsional)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTambahModalOpen, setTambahModalOpen] = useState(false);
  const [pengurusToEdit, setPengurusToEdit] = useState<BoardMember | null>(null);
  const [pengurusToView, setPengurusToView] = useState<BoardMember | null>(null);

  const todayDateFormatted = useMemo(() => {
      return new Date().toLocaleDateString('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
      });
  }, []);

  // Fungsi load data pengurus
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Panggil API untuk get all board members
      const [boardData] = await Promise.all([
          adminService.getAllBoardMembers(),
          // Mungkin perlu ambil tenant info juga jika header buku diperlukan
          // adminService.getTenantInfo(),
      ]);
      setPengurusList(boardData);
      // setTenantInfo(tenantData);
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = `Gagal memuat data pengurus: ${apiError.message}`;
      setError(message);
      toast.error(message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter pengurus berdasarkan nama atau jabatan
  const filteredPengurus = useMemo(() => {
    if (!searchTerm) return pengurusList;
    return pengurusList.filter(p =>
      p.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, pengurusList]);

  // Handler untuk memberhentikan pengurus (soft delete)
  const handleBerhentikan = (nama: string, id: string) => {
    if (window.confirm(`Apakah Anda yakin ingin memberhentikan ${nama} dari jabatannya?`)) {
        // Panggil service removeBoardMember (ini adalah soft delete di backend)
      const promise = adminService.removeBoardMember(id);
      toast.promise(promise, {
        loading: `Memproses pemberhentian ${nama}...`,
        success: () => {
          loadData(); // Muat ulang data
          return `${nama} berhasil diberhentikan dari jabatannya.`;
        },
        error: (err) => {
          const apiError = err as ApiErrorResponse;
          return `Gagal memberhentikan: ${apiError.message}`;
        }
      });
    }
  };

  const handleUpdateSuccess = useCallback(() => {
    loadData();
  }, [loadData]);

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const DaftarPengurusSkeleton = () => (
     <div>
       <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-1/2 mx-auto text-center" />
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm"><Skeleton className="w-full h-10 rounded-lg" /></div>
            <Skeleton className="h-10 w-32 ml-4" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                  <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b text-sm">
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );


  if (loading && pengurusList.length === 0) {
    return <DaftarPengurusSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" />
      <AdminPageHeader
        title="Buku Daftar Pengurus"
        description="Kelola data pengurus koperasi, tambah jabatan, dan lihat riwayat."
        actionButton={
          <Button onClick={() => setTambahModalOpen(true)}>
            <UserPlus size={20} />
            <span>Tambah Jabatan</span>
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Pengurus</h2>
             {/* Header Buku (sama seperti Daftar Anggota, pakai tenantInfo) */}
            <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                 <div className="space-y-2">
                    <div className="flex justify-between border-b border-dotted">
                        <span className="font-semibold text-gray-500">KOPERASI</span>
                        <span className="text-gray-800 font-medium">{tenantInfo?.cooperativeName || 'Memuat...'}</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted">
                        <span className="font-semibold text-gray-500">KAB / KOTA</span>
                        <span className="text-gray-800 font-medium">{tenantInfo?.city || 'Memuat...'}</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between border-b border-dotted">
                        <span className="font-semibold text-gray-500">NO. BADAN HUKUM</span>
                        <span className="text-gray-800 font-medium">{tenantInfo?.legalNumber || 'Memuat...'}</span>
                    </div>
                     <div className="flex justify-between border-b border-dotted">
                        <span className="font-semibold text-gray-500">TANGGAL</span>
                        <span className="text-gray-800 font-medium">{todayDateFormatted}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Cari nama atau jabatan..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading && pengurusList.length > 0}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Nama Lengkap</th>
                  <th className="p-4 font-medium">Jabatan</th>
                  <th className="p-4 font-medium">Tanggal Diangkat</th>
                  <th className="p-4 font-medium">Tanggal Berhenti</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                 {loading && pengurusList.length > 0 && (
                  <tr><td colSpan={6} className="text-center p-8 text-gray-500">Memuat data pengurus...</td></tr>
                )}
                {!loading && filteredPengurus.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-500">
                            {pengurusList.length === 0 ? "Belum ada data pengurus." : "Pengurus tidak ditemukan."}
                        </td>
                    </tr>
                ) : (
                    filteredPengurus.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 text-sm transition-colors duration-150">
                        <td className="p-4">
                           <p className="font-medium text-gray-900">{p.member.fullName}</p>
                           {/* Opsional: Tampilkan NIK atau No. Anggota */}
                           <p className="text-xs text-gray-500">{p.member.memberNumber || p.member.id}</p>
                        </td>
                        <td className="p-4 font-semibold text-brand-red-700">{p.jabatan}</td>
                        <td className="p-4">{new Date(p.tanggalDiangkat).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4">
                            {p.tanggalBerhenti
                                ? new Date(p.tanggalBerhenti).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '-'
                            }
                        </td>
                        <td className="p-4 text-center">
                          <span className={clsx(
                              'px-3 py-1 text-xs font-semibold rounded-full',
                              !p.tanggalBerhenti ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          )}>
                              {!p.tanggalBerhenti ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-1">
                          <button onClick={() => setPengurusToView(p)} className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition" title="Lihat Detail"><Eye size={18} /></button>
                          {/* Tombol Edit hanya untuk yang masih aktif? Atau boleh edit riwayat? Asumsi boleh edit riwayat */}
                          <button onClick={() => setPengurusToEdit(p)} className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition" title="Edit Jabatan"><Edit size={18} /></button>
                          {/* Tombol Berhentikan hanya untuk yang masih aktif */}
                          {!p.tanggalBerhenti && (
                              <button onClick={() => handleBerhentikan(p.member.fullName, p.id)} className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition" title="Berhentikan dari Jabatan"><Trash2 size={18} /></button>
                          )}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Render Modals */}
      <TambahPengurusModal
        isOpen={isTambahModalOpen}
        onClose={() => setTambahModalOpen(false)}
        onPengurusAdded={handleUpdateSuccess}
      />
      <EditPengurusModal
        isOpen={!!pengurusToEdit}
        pengurus={pengurusToEdit}
        onClose={() => setPengurusToEdit(null)}
        onPengurusUpdated={handleUpdateSuccess}
      />
       <DetailPengurusModal
        isOpen={!!pengurusToView}
        pengurus={pengurusToView}
        onClose={() => setPengurusToView(null)}
      />
    </div>
  );
}