"use client";

import { useState, useMemo, FormEvent, useEffect, useCallback, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
// --- UserPlus Dihapus dari sini ---
import { PlusCircle, Search, Eye, XCircle, Edit, Trash2 } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
import { 
    adminService, 
    MemberWithRole, 
    CreateMemberDto, 
    UpdateMemberDto, 
    TenantInfo,
    CreateUserDto // Pastikan ini ada di admin.service.ts
} from '@/services/admin.service';
import { ApiErrorResponse } from "@/types/api.types";
import { Gender } from "@/types/enums";


// ===================================================================
// 1. KOMPONEN MODAL TAMBAH ANGGOTA (DIKEMBALIKAN SEPERTI SEMULA)
// ===================================================================
const TambahAnggotaModal = ({ isOpen, onClose, onAnggotaAdded }: { isOpen: boolean; onClose: () => void; onAnggotaAdded: () => void; }) => {
    const [loading, setLoading] = useState(false);
    const resetForm = (form: HTMLFormElement) => { form.reset(); };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      const formData = new FormData(event.currentTarget);
      const formElement = event.currentTarget;

      // Ambil tanggal dari form (YYYY-MM-DD)
      const dateOfBirthString = formData.get("tanggalLahir") as string;

      // 1. Ambil data DTO untuk Member
      const newAnggotaDto: CreateMemberDto = {
        fullName: formData.get("namaLengkap") as string,
        nik: formData.get("nik") as string,
        gender: formData.get("jenisKelamin") as Gender,
        placeOfBirth: formData.get("tempatLahir") as string,
        // --- PERBAIKAN: Ubah string YYYY-MM-DD menjadi ISO DateTime ---
        dateOfBirth: new Date(dateOfBirthString).toISOString(), 
        occupation: formData.get("pekerjaan") as string,
        address: formData.get("alamat") as string,
        phoneNumber: formData.get("noTelepon") as string,
        // --- PERBAIKAN: Kirim ISO DateTime lengkap, bukan hanya tanggal ---
        joinDate: new Date().toISOString(), 
        status: 'ACTIVE'
      };

      // --- LOGIKA DIKEMBALIKAN ---
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      // --- AKHIR PENGEMBALIAN ---

      try {
        setLoading(true);
        toast.loading('Membuat data anggota...');

        // PANGGILAN 1: Buat Anggota
        const newMember = await adminService.createMember(newAnggotaDto);
        
        // --- LOGIKA DIKEMBALIKAN ---
        // PANGGILAN 2: Buat User (jika diisi)
        if (email && password) {
            toast.loading('Anggota dibuat. Membuat akun login...', { id: 'apiToast' });
            
            const newUserDto: CreateUserDto = {
                email: email,
                password: password,
                memberId: newMember.id, // <-- Gunakan ID dari anggota baru
                role: 'ANGGOTA' 
            };
            
            await adminService.createUser(newUserDto); // Membutuhkan createUser di adminService
        }
        // --- AKHIR PENGEMBALIAN ---

        toast.dismiss('apiToast');
        toast.success(`Anggota "${newMember.fullName}" berhasil ditambahkan!`);
        setLoading(false);
        onAnggotaAdded();
        onClose();
        resetForm(formElement);

      } catch (err) {
        setLoading(false);
        toast.dismiss('apiToast');
        const apiError = err as ApiErrorResponse;
        const message = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
        toast.error(`Gagal menambahkan anggota: ${message}`);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Form Pendaftaran Anggota Baru</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Form fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label><input type="text" name="namaLengkap" id="namaLengkap" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
              <div><label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK*</label><input type="text" name="nik" id="nik" required pattern="\d{16}" title="NIK harus 16 digit" className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label><input type="text" name="tempatLahir" id="tempatLahir" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
              <div><label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label><input type="date" name="tanggalLahir" id="tanggalLahir" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label><select name="jenisKelamin" id="jenisKelamin" required className="mt-1 w-full p-2 border rounded-md bg-white" defaultValue={Gender.MALE} disabled={loading}><option value={Gender.MALE}>Laki-laki</option><option value={Gender.FEMALE}>Perempuan</option></select></div>
              <div><label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label><input type="text" name="pekerjaan" id="pekerjaan" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            </div>
            <div><label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label><textarea name="alamat" id="alamat" rows={3} required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            <div><label htmlFor="noTelepon" className="block text-sm font-medium text-gray-700">No. Telepon*</label><input type="tel" name="noTelepon" id="noTelepon" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            
            {/* --- FORM AKUN DIKEMBALIKAN --- */}
            <div className="border-t pt-4">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Informasi Akun (Opsional)</h3>
              <p className="text-xs text-gray-500 mb-4">Isi email dan password jika anggota ini akan diberikan akses login ke sistem.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" id="email" className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
                  <div><label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label><input type="password" name="password" id="password" minLength={8} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
              </div>
            </div>
            {/* --- AKHIR PENGEMBALIAN --- */}

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Anggota'}</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

// ===================================================================
// 2. KOMPONEN MODAL EDIT ANGGOTA (Tidak ada perubahan)
// ===================================================================
const EditAnggotaModal = ({ isOpen, anggota, onClose, onAnggotaUpdated }: { isOpen: boolean; anggota: MemberWithRole | null; onClose: () => void; onAnggotaUpdated: () => void; }) => {
    const [formData, setFormData] = useState<MemberWithRole | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (anggota) {
        setFormData({ ...anggota, 
          dateOfBirth: anggota.dateOfBirth ? new Date(anggota.dateOfBirth).toISOString().split('T')[0] : '',
          joinDate: anggota.joinDate ? new Date(anggota.joinDate).toISOString().split('T')[0] : '',
          exitDate: anggota.exitDate ? new Date(anggota.exitDate).toISOString().split('T')[0] : null,
        });
      } else { setFormData(null); }
    }, [anggota]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (!formData) return;
      const { name, value } = e.target;
      if (name === 'exitDate' && value === '') { setFormData(prev => ({ ...prev!, [name]: null, exitReason: null })); } 
      else { setFormData(prev => ({ ...prev!, [name]: value })); }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!formData) return;
      setLoading(true);
      
      const updateDto: UpdateMemberDto = {
        fullName: formData.fullName, nik: formData.nik, gender: formData.gender, placeOfBirth: formData.placeOfBirth, 
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(), 
        occupation: formData.occupation, address: formData.address, phoneNumber: formData.phoneNumber,
        status: formData.status as 'ACTIVE' | 'INACTIVE' | 'PENDING',
        exitDate: formData.status === 'INACTIVE' ? (formData.exitDate ? new Date(formData.exitDate).toISOString() : null) : null, 
        exitReason: formData.status === 'INACTIVE' ? (formData.exitReason || null) : null,
      };

      const promise = adminService.updateMember(formData.id, updateDto);

      toast.promise(promise, {
        loading: 'Memperbarui data anggota...',
        success: (result) => { setLoading(false); onAnggotaUpdated(); onClose(); return `Data anggota "${result.fullName}" berhasil diperbarui!`; },
        error: (err) => { setLoading(false); const apiError = err as ApiErrorResponse; return `Gagal memperbarui: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`; }
      });
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Edit Data Anggota</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Form fields... (disederhanakan) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label><input type="text" name="fullName" id="namaLengkap" required value={formData.fullName} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
              <div><label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK*</label><input type="text" name="nik" id="nik" required pattern="\d{16}" title="NIK harus 16 digit" value={formData.nik} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label><input type="text" name="placeOfBirth" id="tempatLahir" required value={formData.placeOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
              <div><label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label><input type="date" name="dateOfBirth" id="tanggalLahir" required value={formData.dateOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label><select name="gender" id="jenisKelamin" required value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white" disabled={loading}><option value={Gender.MALE}>Laki-laki</option><option value={Gender.FEMALE}>Perempuan</option></select></div>
              <div><label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label><input type="text" name="occupation" id="pekerjaan" required value={formData.occupation} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            </div>
            <div><label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label><textarea name="address" id="alamat" rows={3} required value={formData.address} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
            <div><label htmlFor="noTelepon" className="block text-sm font-medium text-gray-700">No. Telepon*</label><input type="tel" name="phoneNumber" id="noTelepon" required value={formData.phoneNumber ?? ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Keanggotaan</label><select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white" disabled={loading}><option value="ACTIVE">Aktif</option><option value="INACTIVE">Berhenti</option><option value="PENDING">Pending</option></select></div>
              {formData.status === 'INACTIVE' && (<><div className="md:col-span-2"><label htmlFor="exitDate" className="block text-sm font-medium text-gray-700">Tanggal Berhenti</label><input type="date" name="exitDate" id="exitDate" value={formData.exitDate || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div>
              <div className="md:col-span-2"><label htmlFor="exitReason" className="block text-sm font-medium text-gray-700">Alasan Berhenti</label><textarea name="exitReason" id="exitReason" rows={2} value={formData.exitReason || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/></div></>)}
            </div>

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
// 3. KOMPONEN MODAL DETAIL ANGGOTA (Tidak ada perubahan)
// ===================================================================
const DetailAnggotaModal = ({ isOpen, anggota, onClose }: { isOpen: boolean; anggota: MemberWithRole | null; onClose: () => void; }) => {
    if (!isOpen || !anggota) return null;
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    const dataPribadi = [ { label: "Nama Lengkap", value: anggota.fullName }, { label: "NIK", value: anggota.nik }, { label: "Nomor Anggota", value: anggota.memberNumber || "-" }, { label: "TTL", value: `${anggota.placeOfBirth}, ${formatDate(anggota.dateOfBirth)}` }, { label: "Jenis Kelamin", value: anggota.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan' }, { label: "Pekerjaan", value: anggota.occupation }, { label: "Alamat", value: anggota.address }, { label: "No. Telepon", value: anggota.phoneNumber || "-" }, { label: "Email", value: anggota.email || "-" }, ];
    const dataKeanggotaan = [ { label: "Tanggal Masuk", value: formatDate(anggota.joinDate) }, { label: "Status", value: anggota.status === 'ACTIVE' ? 'Aktif' : (anggota.status === 'INACTIVE' ? 'Berhenti' : 'Pending') }, { label: "Jabatan", value: anggota.jabatan ? `${anggota.jabatan} (Pengurus)` : (anggota.role || 'Anggota') }, ];
    const dataBerhenti = [ { label: "Tanggal Berhenti", value: formatDate(anggota.exitDate) }, { label: "Alasan Berhenti", value: anggota.exitReason || "-" }, ];
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Detail Anggota</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataPribadi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5 wrap-break-word">{item.value}</dd></div>))}</dl></div>
            <div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Informasi Keanggotaan</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataKeanggotaan.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl></div>
            {anggota.status === 'INACTIVE' && (<div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Informasi Berhenti</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataBerhenti.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5 wrap-break-word">{item.value}</dd></div>))}</dl></div>)}
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button></div>
        </div>
      </div>
    );
  };

// ===================================================================
// 4. KOMPONEN MODAL KONFIRMASI DEAKTIVASI (Tidak ada perubahan)
// ===================================================================
const KonfirmasiDeaktivasiModal = ({
  isOpen,
  anggota,
  onClose,
  onConfirmed,
  isSubmitting,
}: {
  isOpen: boolean;
  anggota: MemberWithRole | null;
  onClose: () => void;
  onConfirmed: (id: string, reason: string) => void;
  isSubmitting: boolean;
}) => {
  const [alasan, setAlasan] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAlasan(anggota?.exitReason || "");
    }
  }, [isOpen, anggota]);

  if (!isOpen || !anggota) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!alasan.trim()) {
      toast.error("Alasan berhenti wajib diisi.");
      return;
    }
    onConfirmed(anggota.id, alasan.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Konfirmasi Menonaktifkan Anggota
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            disabled={isSubmitting}
          >
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              Anda akan menonaktifkan{" "}
              <strong>{anggota.fullName}</strong>. Statusnya akan diubah menjadi{" "}
              <strong>INACTIVE</strong>.
            </p>
            <p className="text-red-600 font-semibold">
              Tindakan ini akan mencatat tanggal berhenti dan alasan di sistem.
            </p>
            <div>
              <label
                htmlFor="alasanBerhenti"
                className="block text-sm font-medium text-gray-700"
              >
                Alasan Berhenti*
              </label>
              <textarea
                id="alasanBerhenti"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={3}
                required
                className="mt-1 w-full p-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Ya, Nonaktifkan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// 5. KOMPONEN BUAT AKUN MODAL --- (DIHAPUS)
// ===================================================================



// ===================================================================
// 6. KOMPONEN UTAMA HALAMAN (DIPERBAIKI)
// ===================================================================
const Skeleton = ({ className = "" }: { className?: string }) => (<div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />);
const DaftarAnggotaSkeleton = () => (
    <div className="p-4 md:p-8"><div className="mb-8"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-2" /></div><div className="bg-white rounded-xl shadow-lg border border-gray-100"><div className="p-6 border-b border-gray-200"><Skeleton className="h-6 w-1/2 mx-auto text-center" />
        <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm"><div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div></div></div><div className="p-6"><div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm"><Skeleton className="w-full h-10 rounded-lg" /></div><Skeleton className="h-10 w-32 ml-4" /></div><div className="overflow-x-auto"><table className="w-full text-left">
        <thead className="border-b bg-gray-50 text-sm text-gray-600"><tr><th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
        <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
        <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th><th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th></tr></thead>
        <tbody>{[...Array(5)].map((_, i) => (<tr key={i} className="border-b text-sm"><td className="p-4"><Skeleton className="h-4 w-32" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4"><Skeleton className="h-4 w-20" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4"><Skeleton className="h-4 w-20" /></td> 
        <td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td><td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td></tr>))}</tbody></table></div></div></div></div>
);

export default function DaftarAnggotaPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [anggotaList, setAnggotaList] = useState<MemberWithRole[]>([]);
    const [tenantInfo] = useState<TenantInfo | null>(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTambahModalOpen, setTambahModalOpen] = useState(false);
    const [anggotaToEdit, setAnggotaToEdit] = useState<MemberWithRole | null>(null);
    const [anggotaToView, setAnggotaToView] = useState<MemberWithRole | null>(null);
    // --- STATE DIHAPUS ---
    // const [anggotaToCreateAccount, setAnggotaToCreateAccount] = useState<MemberWithRole | null>(null);
    // --- AKHIR PENGHAPUSAN ---
    const [anggotaToDeactivate, setAnggotaToDeactivate] = useState<MemberWithRole | null>(null);
    const [isDeactivating, setIsDeactivating] = useState(false);
    
    const todayDateFormatted = useMemo(() => { return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }, []);

    const loadData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const membersData = await adminService.getAllMembers(); 
            setAnggotaList(membersData);
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            const message = `Gagal memuat data anggota: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
            setError(message); toast.error(message);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredAnggota = useMemo(() => { 
        let filtered = anggotaList.filter(anggota => !anggota.jabatan);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(anggota =>
                anggota.fullName.toLowerCase().includes(term) ||
                (anggota.memberNumber && anggota.memberNumber.includes(term)) ||
                anggota.nik.includes(term) ||
                (anggota.role && anggota.role.toLowerCase().includes(term))
            );
        }
        return filtered;
    }, [searchTerm, anggotaList]);

  const handleDeactivateConfirmed = async (id: string, reason: string) => {
    setIsDeactivating(true);
    const promise = adminService.deactivateMember(id, reason);
    toast.promise(promise, {
      loading: "Menonaktifkan anggota...",
      success: (result) => {
        loadData();
        setAnggotaToDeactivate(null);
        setIsDeactivating(false);
        return (
          result?.message ||
          "Anggota berhasil dinonaktifkan (status berubah ke INACTIVE)."
        );
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        setAnggotaToDeactivate(null);
        setIsDeactivating(false);
        return `Gagal menonaktifkan: ${
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message
        }`;
      },
    });
  };

    
    const handleHapus = (anggota: MemberWithRole) => {
        setAnggotaToDeactivate(anggota);
    };

    const handleUpdateSuccess = useCallback(() => { loadData(); }, [loadData]);


    if (loading && anggotaList.length === 0) { return <DaftarAnggotaSkeleton />; }

    return (
        <div>
            <Toaster position="top-right" />
            <AdminPageHeader
                title="Buku Daftar Anggota"
                description="Kelola, tambah, dan cari data anggota koperasi (Non-Pengurus)."
                actionButton={
                    <Button onClick={() => setTambahModalOpen(true)}>
                        <PlusCircle size={20} /><span>Tambah Anggota</span>
                    </Button>
                }
            />

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Anggota</h2>
                    <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">{tenantInfo?.cooperativeName || '-'}</span></div>
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">{tenantInfo?.city || '-'}</span></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">{tenantInfo?.legalNumber || '-'}</span></div>
                            <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL</span><span className="text-gray-800 font-medium">{todayDateFormatted}</span></div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full max-w-sm">
                            <input type="text" placeholder="Cari nama, NIK, No. Anggota, Peran..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading && anggotaList.length > 0}/>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Nama Lengkap</th><th className="p-4 font-medium">No. Anggota</th><th className="p-4 font-medium">Jenis Kelamin</th><th className="p-4 font-medium">Tanggal Masuk</th><th className="p-4 font-medium">Peran</th><th className="p-4 font-medium text-center">Status</th><th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && anggotaList.length > 0 && (<tr><td colSpan={7} className="text-center p-8 text-gray-500">Memuat data anggota...</td></tr>)}
                                {!loading && filteredAnggota.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center p-8 text-gray-500">{anggotaList.filter(a => !a.jabatan).length === 0 ? "Belum ada data anggota non-pengurus." : "Anggota tidak ditemukan."}</td></tr>
                                ) : (
                                    filteredAnggota.map((anggota) => (
                                    <tr key={anggota.id} className="border-b hover:bg-gray-50 text-sm transition-colors duration-150">
                                        <td className="p-4"><p className="font-medium text-gray-900">{anggota.fullName}</p><p className="text-xs text-gray-500">{anggota.nik}</p></td>
                                        <td className="p-4 font-mono">{anggota.memberNumber || '-'}</td>
                                        <td className="p-4">{anggota.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan'}</td>
                                        <td className="p-4">{new Date(anggota.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="p-4">
                                            {/* Kolom 'Peran' ini akan menampilkan 'ANGGOTA' jika ada, atau 'Anggota' jika null */}
                                            <span className="text-gray-600">{anggota.role || 'Anggota'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                          <span className={clsx('px-3 py-1 text-xs font-semibold rounded-full', anggota.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : anggota.status === 'INACTIVE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>
                                                {anggota.status === 'ACTIVE' ? 'Aktif' : (anggota.status === 'INACTIVE' ? 'Berhenti' : 'Pending')}
                                          </span>
                                        </td>
                                        {/* --- BLOK AKSI YANG SUDAH BERSIH --- */}
                                        <td className="p-4 text-center space-x-1">
                                          {/* Tombol Detail (View) */}
                                          <button onClick={() => setAnggotaToView(anggota)} className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition" title="Lihat Detail"><Eye size={18} /></button>
                                          
                                          {/* Tombol Edit */}
                                          <button onClick={() => setAnggotaToEdit(anggota)} className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition" title="Edit Anggota"><Edit size={18} /></button>
                                          
                                          {/* Tombol 'UserPlus' Dihapus dari sini */}

                                          {/* Tombol Nonaktifkan (Hapus) */}
                                          {anggota.status === 'ACTIVE' && (
                                              <button onClick={() => handleHapus(anggota)} className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition" title="Nonaktifkan Anggota"><Trash2 size={18} /></button>
                                          )}
                                        </td>
                                        {/* --- AKHIR BLOK AKSI --- */}
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Render Modals */}
            <TambahAnggotaModal isOpen={isTambahModalOpen} onClose={() => setTambahModalOpen(false)} onAnggotaAdded={handleUpdateSuccess}/>
            <EditAnggotaModal isOpen={!!anggotaToEdit} anggota={anggotaToEdit} onClose={() => setAnggotaToEdit(null)} onAnggotaUpdated={handleUpdateSuccess}/>
            <DetailAnggotaModal isOpen={!!anggotaToView} anggota={anggotaToView} onClose={() => setAnggotaToView(null)}/>
            <KonfirmasiDeaktivasiModal isOpen={!!anggotaToDeactivate} anggota={anggotaToDeactivate} onClose={() => setAnggotaToDeactivate(null)} onConfirmed={handleDeactivateConfirmed} isSubmitting={isDeactivating}/>
            
            {/* --- MODAL BUAT AKUN DIHAPUS DARI SINI --- */}
            {/* <BuatAkunModal ... /> */}
            {/* --- AKHIR PENGHAPUSAN --- */}
        </div>
    );
}