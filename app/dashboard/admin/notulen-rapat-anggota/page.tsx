// Lokasi: frontend/app/dashboard/admin/notulen-rapat-anggota/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, FileText, Download, Edit, Trash2, X, Upload, Loader2, XCircle } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
import {
  adminService,
  MemberMeetingNoteResponse,
  CreateMemberMeetingNoteDto,
  UpdateMemberMeetingNoteDto
} from "@/services/admin.service";
import { ApiErrorResponse } from "@/types/api.types";
import { authService } from "@/services/auth.service";
import { Role } from "@/types/enums";

// ===================================================================
// KOMPONEN MODAL (Untuk Tambah & Edit) - RESPONSIVE
// ===================================================================
const NotulenModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title,
  submitText,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateMemberMeetingNoteDto, file: File | null) => Promise<void>;
  initialData: CreateMemberMeetingNoteDto;
  title: string;
  submitText: string;
}) => {
  const [formData, setFormData] = useState<CreateMemberMeetingNoteDto>(initialData);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setFile(null); // Reset file
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalMembers" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Validasi 2MB
      if (e.target.files[0].size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal adalah 2MB.");
        e.target.value = ""; // Reset input file
        setFile(null);
        return;
      }
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData, file);
      // onClose dipanggil parent jika sukses
    } catch {
      // error sudah di-handle oleh onSave (toast)
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* backdrop klik-untuk-tutup */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-2">
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading} aria-label="Tutup">
              <XCircle size={22} className="sm:size-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meetingType" className="block text-xs sm:text-sm font-medium text-gray-700">Jenis Rapat*</label>
                <select
                  id="meetingType"
                  name="meetingType"
                  required
                  value={formData.meetingType}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg bg-white text-sm"
                  disabled={loading}
                >
                  <option value="">Pilih Jenis Rapat</option>
                  <option value="Rapat Anggota Tahunan (RAT)">Rapat Anggota Tahunan (RAT)</option>
                  <option value="Rapat Anggota Luar Biasa (RALB)">Rapat Anggota Luar Biasa (RALB)</option>
                  <option value="Rapat Anggota Lainnya">Rapat Anggota Lainnya</option>
                </select>
              </div>
              <div>
                <label htmlFor="leader" className="block text-xs sm:text-sm font-medium text-gray-700">Pimpinan Rapat*</label>
                <input
                  type="text"
                  id="leader"
                  name="leader"
                  required
                  value={formData.leader}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg text-sm"
                  disabled={loading}
                  placeholder="Nama pimpinan rapat..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meetingDate" className="block text-xs sm:text-sm font-medium text-gray-700">Tanggal Rapat*</label>
                <input
                  type="date"
                  id="meetingDate"
                  name="meetingDate"
                  required
                  value={formData.meetingDate.split("T")[0]}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-gray-700">Lokasi Rapat*</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg text-sm"
                  disabled={loading}
                  placeholder="Tempat rapat..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="totalMembers" className="block text-xs sm:text-sm font-medium text-gray-700">Jumlah Anggota Hadir*</label>
              <input
                type="number"
                id="totalMembers"
                name="totalMembers"
                required
                value={formData.totalMembers}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-lg text-sm"
                disabled={loading}
                min={0}
                inputMode="numeric"
              />
            </div>

            <div>
              <label htmlFor="agendaAndDecision" className="block text-xs sm:text-sm font-medium text-gray-700">Agenda & Keputusan Rapat*</label>
              <textarea
                id="agendaAndDecision"
                name="agendaAndDecision"
                rows={6}
                value={formData.agendaAndDecision}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-lg text-sm"
                placeholder="Tuliskan agenda pembahasan dan hasil keputusan rapat..."
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="fileUpload" className="block text-xs sm:text-sm font-medium text-gray-700">
                Unggah Dokumen Notulen (PDF/Scan, Max 2MB)
              </label>
              <input
                type="file"
                id="fileUpload"
                name="fileUpload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="mt-1 w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading}
              />
              {file && <p className="text-[11px] sm:text-xs text-gray-500 mt-1 break-all">File dipilih: {file.name}</p>}
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="animate-spin" /> : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL DETAIL NOTULEN - RESPONSIVE
// ===================================================================
const DetailNotulenModal = ({ isOpen, onClose, notulen }: { 
  isOpen: boolean; 
  onClose: () => void; 
  notulen: MemberMeetingNoteResponse | null 
}) => {
  if (!isOpen || !notulen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl">
        <div className="p-4 sm:p-5 border-b flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Notulen</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Tutup">
            <X size={22} className="sm:size-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Tanggal Rapat</p>
              <p className="font-semibold break-words">
                {new Date(notulen.meetingDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jenis Rapat</p>
              <p className="font-semibold sm:text-base">{notulen.meetingType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pimpinan Rapat</p>
              <p className="font-semibold">{notulen.leader}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Lokasi Rapat</p>
              <p className="font-semibold">{notulen.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jumlah Kehadiran</p>
              <p className="font-semibold">{notulen.totalMembers} orang</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Dokumen Terlampir</p>
              {notulen.documentUrl ? (
                <a
                  href={notulen.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline break-all"
                >
                  Lihat/Unduh Dokumen
                </a>
              ) : (
                <p className="font-semibold text-gray-400 italic">Tidak ada</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Agenda & Keputusan:</p>
            <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap font-sans mt-1">
              {notulen.agendaAndDecision}
            </pre>
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-gray-50 border-t flex justify-end gap-2 rounded-b-xl">
          <Button type="button" variant="primary" onClick={onClose} className="w-full sm:w-auto">Tutup</Button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN UTAMA HALAMAN - RESPONSIVE LAYOUT
// ===================================================================
export default function NotulenRapatAnggotaPage() {
  const [notulenList, setNotulenList] = useState<MemberMeetingNoteResponse[]>([]);
  const [filters, setFilters] = useState({ search: '', tanggalMulai: '', tanggalSelesai: '' });
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false); // State untuk hak akses

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedNotulen, setSelectedNotulen] = useState<MemberMeetingNoteResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadData = async () => {
    if (!loading) setLoading(true);
    try {
      const [data, profile, jabatans] = await Promise.all([
        adminService.getMemberMeetingNotes(),
        authService.getProfile(),
        adminService.getMyActiveBoardPositions()
      ]);

      data.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
      setNotulenList(data);

      const isSekretaris = profile.role === Role.Pengurus && jabatans.some(j => j.jabatan === 'Sekretaris');
      setCanEdit(isSekretaris);

    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal memuat data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', tanggalMulai: '', tanggalSelesai: '' });
  };

  const filteredNotulen = useMemo(() => {
    return notulenList.filter(notulen => {
      const tanggalRapat = new Date(notulen.meetingDate);
      const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
      const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
      if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
      if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);

      const searchTerm = filters.search.toLowerCase();

      return (
        (notulen.leader.toLowerCase().includes(searchTerm) ||
          notulen.location.toLowerCase().includes(searchTerm) ||
          notulen.meetingType.toLowerCase().includes(searchTerm) ||
          notulen.agendaAndDecision.toLowerCase().includes(searchTerm)) &&
        (!tanggalMulai || tanggalRapat >= tanggalMulai) &&
        (!tanggalSelesai || tanggalRapat <= tanggalSelesai)
      );
    });
  }, [notulenList, filters]);

  // Skeleton...
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const NotulenRapatAnggotaSkeleton = () => (
    <div className="px-3 sm:px-4 lg:px-6">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
        <Skeleton className="h-3.5 sm:h-4 w-72 sm:w-96 mt-2" />
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <Skeleton className="h-5 sm:h-6 w-2/3 mx-auto" />
          <div className="mt-4 sm:mt-6 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-12 text-sm">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <Skeleton className="h-5 sm:h-6 w-40 mb-4 sm:mb-6" />
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Skeleton className="h-3.5 w-24 mb-2" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-3.5 w-24 mb-2" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white">
                <div className="border-b pb-3">
                  <Skeleton className="h-3 w-40 sm:w-48 mb-2" />
                  <Skeleton className="h-5 w-48 sm:w-64 mt-1" />
                  <Skeleton className="h-3 w-28 sm:w-32 mt-2" />
                </div>
                <div className="py-3 sm:py-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <NotulenRapatAnggotaSkeleton />;
  }

  // --- Fungsi untuk membuka modal ---
  const handleOpenModal = (
    mode: 'add' | 'edit',
    notulen?: MemberMeetingNoteResponse
  ) => {
    setModalMode(mode);
    setSelectedNotulen(notulen || null);
    setIsModalOpen(true);
  };

  // --- Fungsi untuk menyimpan data ---
  const handleSave = async (data: CreateMemberMeetingNoteDto, file: File | null) => {
    const toastId = toast.loading(modalMode === 'add' ? 'Menyimpan notulen...' : 'Memperbarui notulen...');

    const dtoToSend = {
      ...data,
      meetingDate: new Date(data.meetingDate).toISOString(),
    };

    try {
      let savedNotulen: MemberMeetingNoteResponse;

      if (modalMode === 'add') {
        savedNotulen = await adminService.createMemberMeetingNote(dtoToSend);
      } else if (selectedNotulen) {
        savedNotulen = await adminService.updateMemberMeetingNote(selectedNotulen.id, dtoToSend as UpdateMemberMeetingNoteDto);
      } else {
        throw new Error("Aksi tidak valid");
      }

      if (file) {
        toast.loading('Mengunggah dokumen...', { id: toastId });
        await adminService.uploadMemberMeetingNoteDocument(savedNotulen.id, file);
      }

      toast.success('Notulen berhasil disimpan.', { id: toastId });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      toast.error(`Gagal menyimpan: ${message}`, { id: toastId });
      throw apiError;
    }
  };

  // --- Fungsi untuk menghapus notulen ---
  const handleDelete = (id: string, judul: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus notulen untuk "${judul}"?`)) {
      return;
    }

    const promise = adminService.deleteMemberMeetingNote(id);
    toast.promise(promise, {
      loading: 'Menghapus notulen...',
      success: () => {
        loadData();
        return 'Notulen berhasil dihapus.';
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
        return `Gagal menghapus: ${message}`;
      },
    });
  };

  // --- Fungsi untuk membuka modal detail ---
  const handleLihatDetail = (notulen: MemberMeetingNoteResponse) => {
    setSelectedNotulen(notulen);
    setIsDetailModalOpen(true);
  };

  // --- Data awal untuk form tambah ---
  const initialDataForAdd: CreateMemberMeetingNoteDto = {
    meetingDate: new Date().toISOString().split('T')[0],
    leader: '',
    totalMembers: 0,
    agendaAndDecision: '',
    meetingType: '',
    location: ''
  };

  // --- Data awal untuk form edit ---
  const initialDataForEdit: CreateMemberMeetingNoteDto = {
    meetingDate: selectedNotulen ? new Date(selectedNotulen.meetingDate).toISOString().split('T')[0] : '',
    leader: selectedNotulen?.leader || '',
    totalMembers: selectedNotulen?.totalMembers || 0,
    agendaAndDecision: selectedNotulen?.agendaAndDecision || '',
    meetingType: selectedNotulen?.meetingType || '',
    location: selectedNotulen?.location || '',
  };

  return (
    <div className="px-3 sm:px-4 lg:px-6">
      <Toaster position="top-right" />
      <AdminPageHeader
        title="Buku Notulen Rapat Anggota"
        description="Arsipkan dan kelola semua notulensi dari Rapat Anggota."
        actionButton={
          canEdit && (
            <Button onClick={() => handleOpenModal('add')} variant="primary" className="w-full sm:w-auto">
              <PlusCircle size={18} className="sm:size-5" />
              <span className="ml-1.5 sm:ml-2">Tambah Notulen</span>
            </Button>
          )
        }
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Notulen Rapat Anggota
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="search" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Cari Pimpinan/Lokasi/Agenda</label>
                <div className="relative">
                  <input
                    id="search"
                    name="search"
                    type="text"
                    placeholder="Contoh: RAT 2025..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 border rounded-lg text-sm"
                  />
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Rentang Tanggal Rapat</label>
                <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    name="tanggalMulai"
                    type="date"
                    value={filters.tanggalMulai}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <span className="hidden sm:inline text-gray-500">s/d</span>
                  <input
                    name="tanggalSelesai"
                    type="date"
                    value={filters.tanggalSelesai}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end mt-3 gap-2">
              <Button onClick={resetFilters} variant="outline" className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-1 w-full sm:w-auto">
                <X size={14} className="mr-1" /> Reset
              </Button>
            </div>
          </div>

          {/* Grid kartu responsif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredNotulen.map((notulen) => (
              <div
                key={notulen.id}
                className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white hover:shadow-md transition"
              >
                <div className="border-b pb-3">
                  <p className="text-[11px] sm:text-xs text-gray-500 break-words">
                    {new Date(notulen.meetingDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-base sm:text-lg text-brand-red-700 mt-1 break-words">
                    {notulen.meetingType}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    Lokasi: {notulen.location} | Pimpinan: {notulen.leader}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-600">Jumlah Hadir: {notulen.totalMembers} orang</p>
                </div>
                <div className="py-3 sm:py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Agenda/Keputusan (Ringkasan):</p>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 lg:line-clamp-2">
                    {notulen.agendaAndDecision}
                  </p>
                </div>
                <div className="flex flex-wrap justify-between sm:justify-end gap-2 border-t pt-3">
                  <Button
                    onClick={() => handleLihatDetail(notulen)}
                    variant="outline"
                    className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1"
                  >
                    <FileText size={13} className="mr-1" /> Lihat Detail
                  </Button>
                  {notulen.documentUrl && (
                    <a href={notulen.documentUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button variant="outline" className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1">
                        <Download size={13} className="mr-1" /> Unduh
                      </Button>
                    </a>
                  )}
                  {canEdit && (
                    <>
                      <Button
                        onClick={() => handleOpenModal('edit', notulen)}
                        variant="outline"
                        className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1"
                      >
                        <Edit size={13} className="mr-1" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(notulen.id, notulen.meetingType)}
                        variant="outline"
                        className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 size={13} className="mr-1" /> Hapus
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredNotulen.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3 text-center p-8 sm:p-10 text-gray-500 text-sm sm:text-base">
                {!loading && notulenList.length === 0
                  ? "Belum ada data notulen rapat anggota."
                  : "Tidak ada notulen yang sesuai dengan filter."}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <NotulenModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          title={modalMode === 'add' ? 'Tambah Notulen Baru' : 'Edit Notulen Rapat'}
          submitText={modalMode === 'add' ? 'Simpan Notulen' : 'Simpan Perubahan'}
          initialData={modalMode === 'add' ? initialDataForAdd : initialDataForEdit}
        />
      )}

      {isDetailModalOpen && (
        <DetailNotulenModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          notulen={selectedNotulen}
        />
      )}
    </div>
  );
}
