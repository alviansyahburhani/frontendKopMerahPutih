// Lokasi: frontend/app/dashboard/admin/notulen-rapat-pengawas/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, FileText, Download, Edit, Trash2, X, Upload, Loader2, XCircle } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
import {
  adminService,
  SupervisorMeetingNoteResponse, 
  CreateSupervisorMeetingNoteDto,  
  UpdateSupervisorMeetingNoteDto   
} from "@/services/admin.service";
import { ApiErrorResponse } from "@/types/api.types";
import { authService } from "@/services/auth.service";
import { Role } from "@/types/enums"; 

// ===================================================================
// KOMPONEN MODAL (Untuk Tambah & Edit)
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
  onSave: (data: CreateSupervisorMeetingNoteDto, file: File | null) => Promise<void>;
  initialData: CreateSupervisorMeetingNoteDto;
  title: string;
  submitText: string;
}) => {
  const [formData, setFormData] = useState<CreateSupervisorMeetingNoteDto>(initialData);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setFile(null); // Reset file
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 2 * 1024 * 1024) { // Validasi 2MB
        toast.error("Ukuran file maksimal adalah 2MB.");
        e.target.value = ""; 
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
    } catch (error) {
      // error sudah di-handle oleh onSave (toast)
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}>
              <XCircle size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-4 overflow-y-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700">Jenis Rapat*</label>
                    <input type="text" id="meetingType" name="meetingType" required 
                    value={formData.meetingType} 
                    onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" disabled={loading} placeholder="Mis: Pemeriksaan Kas Bulanan..."/>
                </div>
                <div>
                    <label htmlFor="leader" className="block text-sm font-medium text-gray-700">Pimpinan Rapat*</label>
                    <input type="text" id="leader" name="leader" required 
                    value={formData.leader} 
                    onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" disabled={loading} placeholder="Nama pimpinan rapat..."/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meetingDate" className="block text-sm font-medium text-gray-700">Tanggal Rapat*</label>
                <input type="date" id="meetingDate" name="meetingDate" required
                  value={formData.meetingDate.split("T")[0]} 
                  onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" disabled={loading} />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi Rapat*</label>
                <input type="text" id="location" name="location" required 
                  value={formData.location} 
                  onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" disabled={loading} placeholder="Tempat rapat..."/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supervisoryPresent" className="block text-sm font-medium text-gray-700">Jumlah Pengawas Hadir*</label>
                <input type="number" id="supervisoryPresent" name="supervisoryPresent" required 
                  value={formData.supervisoryPresent} 
                  onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" disabled={loading} />
              </div>
               <div>
                <label htmlFor="totalSupervisory" className="block text-sm font-medium text-gray-700">Total Pengawas*</label>
                <input type="number" id="totalSupervisory" name="totalSupervisory" required 
                  value={formData.totalSupervisory} 
                  onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" disabled={loading} />
              </div>
            </div>

            <div>
              <label htmlFor="agendaAndDecision" className="block text-sm font-medium text-gray-700">Agenda & Keputusan Rapat*</label>
              <textarea id="agendaAndDecision" name="agendaAndDecision" rows={6} 
                value={formData.agendaAndDecision} 
                onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" 
                placeholder="Tuliskan agenda pembahasan dan hasil keputusan rapat..." 
                disabled={loading} />
            </div>

            <div>
              <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">Unggah Dokumen Notulen (PDF/Scan, Max 2MB)</label>
              <input type="file" id="fileUpload" name="fileUpload" accept=".pdf,.jpg,.jpeg,.png" 
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                disabled={loading}/>
              {file && <p className="text-xs text-gray-500 mt-1">File dipilih: {file.name}</p>}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL DETAIL NOTULEN
// ===================================================================
const DetailNotulenModal = ({ isOpen, onClose, notulen }: { 
  isOpen: boolean; 
  onClose: () => void; 
  notulen: SupervisorMeetingNoteResponse | null 
}) => {
  if (!isOpen || !notulen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Detail Notulen</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
              <p className="text-sm text-gray-500">Jenis Rapat</p>
              <p className="font-semibold text-lg">{notulen.meetingType}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-sm text-gray-500">Tanggal Rapat</p>
              <p className="font-semibold">{new Date(notulen.meetingDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
             <div>
              <p className="text-sm text-gray-500">Pimpinan Rapat</p>
              <p className="font-semibold">{notulen.leader}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="font-semibold">{notulen.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kehadiran</p>
              <p className="font-semibold">{notulen.supervisoryPresent} dari {notulen.totalSupervisory} Pengawas</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dokumen Terlampir</p>
              {notulen.documentUrl ? (
                 <a href={notulen.documentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
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
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
          <Button type="button" variant="primary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function NotulenRapatPengawasPage() {
  const [notulenList, setNotulenList] = useState<SupervisorMeetingNoteResponse[]>([]);
  const [filters, setFilters] = useState({ search: '' });
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false); // State untuk hak akses

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedNotulen, setSelectedNotulen] = useState<SupervisorMeetingNoteResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadData = async () => {
    if (!loading) setLoading(true);
    try {
      const [data, profile, jabatans] = await Promise.all([
        adminService.getSupervisorMeetingNotes(), 
        authService.getProfile(),
        adminService.getMyActiveBoardPositions()
      ]);
      
      data.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
      setNotulenList(data);

      const isSekretaris = profile.role === Role.Pengurus && jabatans.some(j => j.jabatan === 'Sekretaris');
      const isPengawas = profile.role === Role.Pengawas;
      setCanEdit(isSekretaris || isPengawas); 

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

  const resetFilters = () => setFilters({ search: '' });

  const filteredNotulen = useMemo(() => {
    return notulenList.filter(notulen => {
      const searchTerm = filters.search.toLowerCase();
      return (
        notulen.meetingType.toLowerCase().includes(searchTerm) || 
        notulen.leader.toLowerCase().includes(searchTerm) ||
        notulen.location.toLowerCase().includes(searchTerm) ||
        notulen.agendaAndDecision.toLowerCase().includes(searchTerm)
      );
    });
  }, [notulenList, filters]);

  // Skeleton...
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const NotulenRapatPengawasSkeleton = () => (
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
            <div className="grow"><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="w-full h-10 rounded-lg" /></div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="border-b pb-3"><Skeleton className="h-3 w-48 mb-2" /><Skeleton className="h-5 w-64 mt-1" /><Skeleton className="h-3 w-32 mt-2" /></div>
                <div className="py-4"><Skeleton className="h-4 w-24 mb-2" /><div className="space-y-1"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div></div>
                <div className="flex justify-end gap-2 border-t pt-3"><Skeleton className="h-8 w-20 rounded" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <NotulenRapatPengawasSkeleton />;
  }

  // --- Fungsi untuk membuka modal ---
  const handleOpenModal = (
    mode: 'add' | 'edit',
    notulen?: SupervisorMeetingNoteResponse
  ) => {
    setModalMode(mode);
    setSelectedNotulen(notulen || null);
    setIsModalOpen(true);
  };
  
  // --- Fungsi untuk menyimpan data (baik tambah maupun edit) ---
  const handleSave = async (data: CreateSupervisorMeetingNoteDto, file: File | null) => {
    const toastId = toast.loading(modalMode === 'add' ? 'Menyimpan notulen...' : 'Memperbarui notulen...');
    
    const dtoToSend = {
      ...data,
      meetingDate: new Date(data.meetingDate).toISOString(),
    };

    try {
      let savedNotulen: SupervisorMeetingNoteResponse;

      if (modalMode === 'add') {
        savedNotulen = await adminService.createSupervisorMeetingNote(dtoToSend);
      } else if (selectedNotulen) {
        const updateDto: UpdateSupervisorMeetingNoteDto = dtoToSend;
        savedNotulen = await adminService.updateSupervisorMeetingNote(selectedNotulen.id, updateDto);
      } else {
        throw new Error("Aksi tidak valid");
      }

      if (file) {
        toast.loading('Mengunggah dokumen...', { id: toastId });
        await adminService.uploadSupervisorMeetingNoteDocument(savedNotulen.id, file);
      }

      toast.success('Notulen berhasil disimpan.', { id: toastId });
      setIsModalOpen(false);
      loadData(); // Muat ulang data
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
    
    const promise = adminService.deleteSupervisorMeetingNote(id);
    toast.promise(promise, {
      loading: 'Menghapus notulen...',
      success: () => {
        loadData(); // Muat ulang data
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
  const handleLihatDetail = (notulen: SupervisorMeetingNoteResponse) => {
    setSelectedNotulen(notulen);
    setIsDetailModalOpen(true);
  };
  
  // --- Data awal untuk form tambah ---
  const initialDataForAdd: CreateSupervisorMeetingNoteDto = {
    meetingDate: new Date().toISOString().split('T')[0],
    location: '',
    meetingType: '',
    totalSupervisory: 0,
    supervisoryPresent: 0,
    leader: '',
    agendaAndDecision: '',
  };

  // --- Data awal untuk form edit ---
  const initialDataForEdit: CreateSupervisorMeetingNoteDto = {
    meetingDate: selectedNotulen ? new Date(selectedNotulen.meetingDate).toISOString().split('T')[0] : '',
    location: selectedNotulen?.location || '',
    meetingType: selectedNotulen?.meetingType || '',
    totalSupervisory: selectedNotulen?.totalSupervisory || 0,
    supervisoryPresent: selectedNotulen?.supervisoryPresent || 0,
    leader: selectedNotulen?.leader || '',
    agendaAndDecision: selectedNotulen?.agendaAndDecision || '',
  };

  return (
    <div>
      <Toaster position="top-right" />
      <AdminPageHeader
        title="Buku Notulen Rapat Pengawas"
        description="Arsipkan dan kelola semua notulensi dari rapat internal dewan pengawas."
        actionButton={
          canEdit && (
            <Button onClick={() => handleOpenModal('add')} variant="primary">
                <PlusCircle size={20} /><span>Tambah Notulen</span>
            </Button>
          )
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Notulen Rapat Pengawas
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span></div>
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">KOTA MAKASSAR</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span></div>
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL CETAK</span><span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
              <div className="grow">
                {/* [PERBAIKAN] Label filter diperbarui */}
                <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Jenis Rapat / Pimpinan / Agenda</label>
                <div className="relative">
                  <input id="search" name="search" type="text" placeholder="Ketik kata kunci..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <Button onClick={resetFilters} variant="outline"><X size={16} /> Reset</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotulen.map((notulen) => (
              <div key={notulen.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition">
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500">{new Date(notulen.meetingDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <h3 className="font-bold text-lg text-brand-red-700 mt-1">{notulen.meetingType}</h3>
                  <p className="text-sm text-gray-600">Pimpinan: {notulen.leader} | Lokasi: {notulen.location}</p>
                  <p className="text-xs text-gray-600">Kehadiran: {notulen.supervisoryPresent} dari {notulen.totalSupervisory} pengawas</p>
                </div>
                <div className="py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Agenda/Keputusan (Ringkasan):</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notulen.agendaAndDecision}
                  </p>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button onClick={() => handleLihatDetail(notulen)} variant="outline" className="text-xs px-3 py-1"><FileText size={14}/> Lihat Detail</Button>
                  {notulen.documentUrl && <a href={notulen.documentUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="text-xs px-3 py-1"><Download size={14}/> Unduh</Button></a>}
                  {canEdit && (
                    <>
                      <Button onClick={() => handleOpenModal('edit', notulen)} variant="outline" className="text-xs px-3 py-1"><Edit size={14}/> Edit</Button>
                      <Button onClick={() => handleDelete(notulen.id, notulen.meetingType)} variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={14}/> Hapus</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
             {filteredNotulen.length === 0 && (
              <div className="lg:col-span-2 text-center p-10 text-gray-500">
                  {!loading && notulenList.length === 0 ? "Belum ada data notulen rapat pengawas." : "Tidak ada notulen yang sesuai dengan filter."}
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