"use client";

import { useState, useMemo, FormEvent, useEffect, useCallback, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, XCircle, Edit, Trash2 } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
// --- MODIFIKASI: Impor tipe MemberWithRole dari admin.service (atau types) ---
import { adminService, MemberWithRole, CreateMemberDto, UpdateMemberDto, TenantInfo } from '@/services/admin.service';
import { ApiErrorResponse } from "@/types/api.types";
import { Gender } from "@/types/enums";

// ... (Kode Modal Tambah, Edit, Detail TETAP SAMA seperti sebelumnya) ...
// KOMPONEN MODAL UNTUK TAMBAH ANGGOTA (DIMODIFIKASI UNTUK API)
const TambahAnggotaModal = ({
    isOpen, // Tambahkan prop isOpen
    onClose,
    onAnggotaAdded // Callback setelah sukses
  }: {
    isOpen: boolean;
    onClose: () => void;
    onAnggotaAdded: () => void; // Tidak perlu mengembalikan anggota baru, panggil loadData saja
  }) => {
    const [loading, setLoading] = useState(false);

    // Fungsi untuk reset form (jika diperlukan saat modal dibuka/tutup)
    const resetForm = (form: HTMLFormElement) => {
        form.reset();
        // Reset state internal komponen jika ada
    };

    useEffect(() => {
      // Optional: Reset form saat modal dibuka jika ada form element ref
    }, [isOpen]);


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      const formData = new FormData(event.currentTarget);
      const formElement = event.currentTarget; // Simpan referensi form

      const newAnggotaDto: CreateMemberDto = {
        fullName: formData.get("namaLengkap") as string,
        nik: formData.get("nik") as string, // Tambahkan NIK
        gender: formData.get("jenisKelamin") as Gender,
        placeOfBirth: formData.get("tempatLahir") as string,
        dateOfBirth: formData.get("tanggalLahir") as string,
        occupation: formData.get("pekerjaan") as string,
        address: formData.get("alamat") as string,
        phoneNumber: formData.get("noTelepon") as string, // Tambahkan noTelepon
        email: formData.get("email") as string || undefined, // Jadi undefined jika kosong
        password: formData.get("password") as string || undefined, // Jadi undefined jika kosong
        joinDate: new Date().toISOString().split('T')[0], // Default tanggal hari ini
        status: 'ACTIVE' // Default aktif
      };

      // --- Gunakan adminService ---
      const promise = adminService.createMember(newAnggotaDto);

      toast.promise(promise, {
        loading: 'Menyimpan anggota baru...',
        success: (result) => {
          setLoading(false);
          onAnggotaAdded(); // Panggil callback sukses (akan memuat ulang data)
          onClose(); // Tutup modal
          resetForm(formElement); // Reset form setelah sukses
          // --- Sesuaikan pesan sukses jika perlu ---
          return `Anggota "${result.fullName}" berhasil ditambahkan!`;
        },
        error: (err) => {
          setLoading(false);
          const apiError = err as ApiErrorResponse;
          return `Gagal menambahkan anggota: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
        }
      });
    };

    if (!isOpen) return null; // Jangan render jika tidak terbuka

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Form Pendaftaran Anggota Baru</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* --- Form fields (NIK, No Telepon, dll.) tetap sama --- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label>
                  <input type="text" name="namaLengkap" id="namaLengkap" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
                 <div>
                  <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK*</label>
                  <input type="text" name="nik" id="nik" required pattern="\d{16}" title="NIK harus 16 digit" className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
              </div>
              {/* --- Field lainnya sama --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label>
                  <input type="text" name="tempatLahir" id="tempatLahir" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
                <div>
                    <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label>
                    <input type="date" name="tanggalLahir" id="tanggalLahir" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label>
                    <select name="jenisKelamin" id="jenisKelamin" required className="mt-1 w-full p-2 border rounded-md bg-white" defaultValue={Gender.MALE} disabled={loading}>
                        <option value={Gender.MALE}>Laki-laki</option>
                        <option value={Gender.FEMALE}>Perempuan</option>
                    </select>
                </div>
                 <div>
                  <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label>
                  <input type="text" name="pekerjaan" id="pekerjaan" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
              </div>
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label>
                <textarea name="alamat" id="alamat" rows={3} required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
              </div>
               <div>
                  <label htmlFor="noTelepon" className="block text-sm font-medium text-gray-700">No. Telepon*</label>
                  <input type="tel" name="noTelepon" id="noTelepon" required className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
             {/* --- Info Akun Opsional --- */}
             <div className="border-t pt-4">
                <h3 className="text-base font-semibold text-gray-700 mb-2">Informasi Akun (Opsional)</h3>
                <p className="text-xs text-gray-500 mb-4">Isi email dan password jika anggota ini akan diberikan akses login ke sistem.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" minLength={8} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                        <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter jika diisi.</p>
                    </div>
                </div>
             </div>
            {/* --- Footer Modal --- */}
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Anggota'}</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

const EditAnggotaModal = ({
    isOpen,
    anggota, // Tipe di sini otomatis menjadi MemberWithRole karena state di parent
    onClose,
    onAnggotaUpdated
  }: {
    isOpen: boolean;
    anggota: MemberWithRole | null; // Gunakan MemberWithRole
    onClose: () => void;
    onAnggotaUpdated: () => void;
  }) => {
    // --- State lokal BISA tetap menggunakan MemberWithRole ---
    const [formData, setFormData] = useState<MemberWithRole | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (anggota) {
        // Konversi tanggal tetap sama
        setFormData({
          ...anggota,
          dateOfBirth: anggota.dateOfBirth ? new Date(anggota.dateOfBirth).toISOString().split('T')[0] : '',
          joinDate: anggota.joinDate ? new Date(anggota.joinDate).toISOString().split('T')[0] : '',
          // --- MODIFIKASI: exitDate mungkin sudah ada di tipe MemberWithRole ---
          exitDate: anggota.exitDate ? new Date(anggota.exitDate).toISOString().split('T')[0] : null, // Pastikan bisa null
        });
      } else {
        setFormData(null);
      }
    }, [anggota]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (!formData) return;
      const { name, value } = e.target;
      // Logika untuk exitDate dan exitReason tetap sama
       if (name === 'exitDate' && value === '') {
            setFormData(prev => ({ ...prev!, [name]: null, exitReason: null }));
        } else {
            setFormData(prev => ({ ...prev!, [name]: value }));
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!formData) return;
      setLoading(true);

      // Siapkan DTO Update (hanya kirim field yang relevan untuk diupdate)
      // DTO TIDAK PERLU menyertakan role atau jabatan, karena itu diatur backend
      const updateDto: UpdateMemberDto = {
        fullName: formData.fullName,
        nik: formData.nik,
        gender: formData.gender,
        placeOfBirth: formData.placeOfBirth,
        dateOfBirth: formData.dateOfBirth,
        occupation: formData.occupation,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        status: formData.status === 'ACTIVE' || formData.status === 'INACTIVE' || formData.status === 'PENDING'
          ? formData.status
          : undefined, // Kirim status jika valid
        exitDate: formData.exitDate || null, // Kirim null jika kosong
        exitReason: formData.exitDate ? (formData.exitReason || '') : null, // Kirim reason hanya jika ada exitDate
      };

      // --- Gunakan adminService ---
      const promise = adminService.updateMember(formData.id, updateDto);

      toast.promise(promise, {
        loading: 'Memperbarui data anggota...',
        success: (result) => {
          setLoading(false);
          onAnggotaUpdated();
          onClose();
           // --- Sesuaikan pesan sukses jika perlu ---
          return `Data anggota "${result.fullName}" berhasil diperbarui!`;
        },
        error: (err) => {
          setLoading(false);
          const apiError = err as ApiErrorResponse;
          return `Gagal memperbarui: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
        }
      });
    };

    if (!isOpen || !formData) return null;

    // --- Render Form (Tampilan form EditAnggotaModal tetap sama) ---
    return (
       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Edit Data Anggota</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800" disabled={loading}><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* --- Form fields (NIK, No Telepon, dll.) tetap sama --- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label>
                  <input type="text" name="fullName" id="namaLengkap" required value={formData.fullName} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
                <div>
                  <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK*</label>
                  <input type="text" name="nik" id="nik" required pattern="\d{16}" title="NIK harus 16 digit" value={formData.nik} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
              </div>
              {/* --- Field lainnya sama --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label>
                  <input type="text" name="placeOfBirth" id="tempatLahir" required value={formData.placeOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
                <div>
                    <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label>
                    <input type="date" name="dateOfBirth" id="tanggalLahir" required value={formData.dateOfBirth} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label>
                    <select name="gender" id="jenisKelamin" required value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white" disabled={loading}>
                        <option value={Gender.MALE}>Laki-laki</option>
                        <option value={Gender.FEMALE}>Perempuan</option>
                    </select>
                </div>
                <div>
                  <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label>
                  <input type="text" name="occupation" id="pekerjaan" required value={formData.occupation} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                </div>
              </div>
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label>
                <textarea name="address" id="alamat" rows={3} required value={formData.address} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
              </div>
              <div>
                  <label htmlFor="noTelepon" className="block text-sm font-medium text-gray-700">No. Telepon*</label>
                  <input type="tel" name="phoneNumber" id="noTelepon" required value={formData.phoneNumber ?? ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
              </div>

              {/* --- Field Status & Berhenti (TETAP SAMA) --- */}
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Keanggotaan</label>
                  <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white" disabled={loading}>
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Berhenti</option>
                      <option value="PENDING">Pending</option>
                  </select>
                </div>
                {/* Hanya tampilkan field berhenti jika status INACTIVE */}
                {formData.status === 'INACTIVE' && (
                  <>
                    <div>
                      <label htmlFor="exitDate" className="block text-sm font-medium text-gray-700">Tanggal Berhenti</label>
                      <input type="date" name="exitDate" id="exitDate" value={formData.exitDate || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="exitReason" className="block text-sm font-medium text-gray-700">Alasan Berhenti</label>
                      <textarea name="exitReason" id="exitReason" rows={2} value={formData.exitReason || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" disabled={loading}/>
                    </div>
                  </>
                )}
              </div>

            {/* --- Footer Modal --- */}
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

const DetailAnggotaModal = ({
    isOpen,
    anggota, // Tipe di sini otomatis menjadi MemberWithRole
    onClose
  }: {
    isOpen: boolean;
    anggota: MemberWithRole | null; // Gunakan MemberWithRole
    onClose: () => void;
  }) => {
    if (!isOpen || !anggota) return null;

    // Data pribadi tetap sama
    const dataPribadi = [
        { label: "Nama Lengkap", value: anggota.fullName },
        { label: "NIK", value: anggota.nik },
        { label: "Nomor Anggota", value: anggota.memberNumber || "-" },
        { label: "Tempat, Tanggal Lahir", value: `${anggota.placeOfBirth}, ${new Date(anggota.dateOfBirth).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}` },
        { label: "Jenis Kelamin", value: anggota.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan' },
        { label: "Pekerjaan", value: anggota.occupation },
        { label: "Alamat", value: anggota.address },
        { label: "No. Telepon", value: anggota.phoneNumber },
        { label: "Email", value: anggota.email || "-" },
      ];

    // --- MODIFIKASI: Tambahkan Jabatan/Role di data keanggotaan ---
    const dataKeanggotaan = [
      { label: "Tanggal Masuk", value: new Date(anggota.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) },
      { label: "Status", value: anggota.status === 'ACTIVE' ? 'Aktif' : (anggota.status === 'INACTIVE' ? 'Berhenti' : 'Pending') },
      { label: "Jabatan", value: anggota.jabatan ? `${anggota.jabatan} (Pengurus)` : (anggota.role || 'Anggota') }, // Tampilkan jabatan atau role
    ];
    // Data berhenti tetap sama
     const dataBerhenti = [
        { label: "Tanggal Berhenti", value: anggota.exitDate ? new Date(anggota.exitDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-" },
        { label: "Alasan Berhenti", value: anggota.exitReason || "-" },
      ];


    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Detail Anggota</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="border-b pb-4">
                <h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataPribadi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5 wrap-break-word">{item.value}</dd></div>))}</dl>
            </div>
            {/* Tampilkan Informasi Keanggotaan yang sudah dimodifikasi */}
            <div className="border-b pb-4">
                <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Keanggotaan</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataKeanggotaan.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl>
            </div>
             {/* Tampilan Informasi Berhenti tetap sama */}
             {anggota.status === 'INACTIVE' && (
                <div className="border-b pb-4">
                    <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Berhenti</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataBerhenti.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5 wrap-break-word">{item.value}</dd></div>))}</dl>
                </div>
             )}
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button>
          </div>
        </div>
      </div>
    );
  };

// ===================================================================
// KOMPONEN UTAMA HALAMAN (Menggunakan adminService)
// ===================================================================
export default function DaftarAnggotaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [anggotaList, setAnggotaList] = useState<MemberWithRole[]>([]); // Tipe sudah sesuai
  const [tenantInfo] = useState<TenantInfo | null>(null); // State TenantInfo tetap (setTenantInfo not used)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTambahModalOpen, setTambahModalOpen] = useState(false);
  const [anggotaToEdit, setAnggotaToEdit] = useState<MemberWithRole | null>(null); // Tipe sudah sesuai
  const [anggotaToView, setAnggotaToView] = useState<MemberWithRole | null>(null); // Tipe sudah sesuai

  const todayDateFormatted = useMemo(() => { /* ... tetap sama ... */
      return new Date().toLocaleDateString('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
      });
  }, []);

  // --- Gunakan adminService untuk memuat data ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- Panggil adminService.getAllMembers() ---
      // (Pastikan tipe return di service sudah MemberWithRole[])
      const membersData = await adminService.getAllMembers();
      setAnggotaList(membersData);

      // --- Ambil TenantInfo jika diperlukan (misalnya dari /tenants/:subdomain atau endpoint khusus) ---
      // Contoh (jika ada endpoint):
      // const tenantData = await adminService.getTenantInfo();
      // setTenantInfo(tenantData);

    } catch (err) {
      // Error handling tetap sama
      const apiError = err as ApiErrorResponse;
      const message = `Gagal memuat data anggota: ${Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message}`;
      setError(message);
      toast.error(message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Dependensi loadData tidak berubah

  useEffect(() => {
    loadData();
  }, [loadData]); // Efek tetap sama

  // Filter anggota (sudah dimodifikasi sebelumnya untuk role/jabatan)
  const filteredAnggota = useMemo(() => { /* ... tetap sama ... */
     if (!searchTerm) return anggotaList;
      return anggotaList.filter(anggota =>
        anggota.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (anggota.memberNumber && anggota.memberNumber.includes(searchTerm)) ||
        anggota.nik.includes(searchTerm) ||
        // --- MODIFIKASI: Cari berdasarkan Jabatan/Role juga ---
        (anggota.jabatan && anggota.jabatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (anggota.role && anggota.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [searchTerm, anggotaList]);

  // Handler Hapus/Nonaktifkan (gunakan adminService)
  const handleHapus = (nama: string, id: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menonaktifkan anggota "${nama}"?`)) {
      // --- Panggil adminService.deleteMember() ---
      const promise = adminService.deleteMember(id); // Asumsi ini melakukan soft delete
      toast.promise(promise, {
        loading: `Memproses anggota "${nama}"...`,
        success: () => {
          loadData(); // Muat ulang data
          return `Anggota "${nama}" berhasil dinonaktifkan.`; // Update pesan
        },
        error: (err) => {
          const apiError = err as ApiErrorResponse;
          return `Gagal memproses: ${apiError.message}`;
        }
      });
    }
  };

  // Callback sukses (tetap sama)
  const handleUpdateSuccess = useCallback(() => {
    loadData();
  }, [loadData]);

  // Skeleton components (tetap sama)
  const Skeleton = ({ className = "" }: { className?: string }) => ( /* ... */
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );
  const DaftarAnggotaSkeleton = () => ( /* ... (Skeleton Tabel HARUS DISESUAIKAN tambah 1 kolom) ... */
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
                  {/* --- MODIFIKASI: Tambah Header Jabatan --- */}
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th><th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>{/* Jabatan */}<th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th><th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b text-sm">
                    {/* --- MODIFIKASI: Tambah Cell Jabatan --- */}
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4"><Skeleton className="h-4 w-20" /></td><td className="p-4"><Skeleton className="h-4 w-24" /></td><td className="p-4"><Skeleton className="h-4 w-20" /></td> {/* Jabatan */}<td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td><td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );


  // Render utama (Tabel sudah dimodifikasi di langkah sebelumnya)
   if (loading && anggotaList.length === 0) { // Tampilkan skeleton hanya jika benar-benar loading awal
    return <DaftarAnggotaSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" />
      <AdminPageHeader
        title="Buku Daftar Anggota"
        description="Kelola, tambah, dan cari data anggota koperasi."
        actionButton={
          <Button onClick={() => setTambahModalOpen(true)}>
            <PlusCircle size={20} />
            <span>Tambah Anggota</span>
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Anggota</h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            {/* ... Info Koperasi ... */}
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
            {/* ... Input Search ... */}
             <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Cari nama, NIK, No. Anggota, Jabatan..." // Update placeholder
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading && anggotaList.length > 0} // Disable hanya saat loading update
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

          <div className="overflow-x-auto">
            {/* Tabel sudah dimodifikasi di langkah sebelumnya */}
             <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  {/* --- MODIFIKASI: Tambah Header Jabatan --- */}
                  <th className="p-4 font-medium">Nama Lengkap</th><th className="p-4 font-medium">No. Anggota</th><th className="p-4 font-medium">Jenis Kelamin</th><th className="p-4 font-medium">Tanggal Masuk</th><th className="p-4 font-medium">Jabatan / Peran</th> {/* Kolom Baru */}<th className="p-4 font-medium text-center">Status</th><th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* Tampilkan loading di tengah tabel jika sedang memuat ulang */}
                {loading && anggotaList.length > 0 && (
                  <tr><td colSpan={7} className="text-center p-8 text-gray-500">Memuat data anggota...</td></tr>
                )}

                {!loading && filteredAnggota.length === 0 ? (
                    <tr>
                        {/* --- MODIFIKASI: Sesuaikan colspan --- */}
                        <td colSpan={7} className="text-center p-8 text-gray-500">
                            {anggotaList.length === 0 ? "Belum ada data anggota." : "Anggota tidak ditemukan."}
                        </td>
                    </tr>
                ) : (
                    filteredAnggota.map((anggota) => (
                    <tr key={anggota.id} className="border-b hover:bg-gray-50 text-sm transition-colors duration-150">
                        <td className="p-4">
                            <p className="font-medium text-gray-900">{anggota.fullName}</p>
                            <p className="text-xs text-gray-500">{anggota.nik}</p>
                        </td>
                        <td className="p-4 font-mono">{anggota.memberNumber || '-'}</td>
                        <td className="p-4">{anggota.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan'}</td>
                        <td className="p-4">{new Date(anggota.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        {/* --- MODIFIKASI: Tampilkan Jabatan/Role --- */}
                        <td className="p-4">
                          {/* Prioritaskan Jabatan Spesifik, fallback ke Role Umum */}
                          {anggota.jabatan ? (
                            <span className="font-semibold text-brand-red-700">{anggota.jabatan}</span>
                          ) : (
                            <span className="text-gray-600">{anggota.role || 'Anggota'}</span> // Default 'Anggota' jika role null
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={clsx(
                              'px-3 py-1 text-xs font-semibold rounded-full',
                              anggota.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                              anggota.status === 'INACTIVE' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                          )}>
                              {anggota.status === 'ACTIVE' ? 'Aktif' : (anggota.status === 'INACTIVE' ? 'Berhenti' : 'Pending')}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-1">
                          <button onClick={() => setAnggotaToView(anggota)} className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition" title="Lihat Detail"><Eye size={18} /></button>
                          <button onClick={() => setAnggotaToEdit(anggota)} className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition" title="Edit Anggota"><Edit size={18} /></button>
                          {/* Logika Hapus (Nonaktifkan) bisa disesuaikan, mungkin hanya untuk status ACTIVE */}
                           {anggota.status === 'ACTIVE' && ( // Hanya bisa menonaktifkan yang aktif
                             <button onClick={() => handleHapus(anggota.fullName, anggota.id)} className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition" title="Nonaktifkan Anggota"><Trash2 size={18} /></button>
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

      {/* Render Modals (tetap sama) */}
       <TambahAnggotaModal
        isOpen={isTambahModalOpen}
        onClose={() => setTambahModalOpen(false)}
        onAnggotaAdded={handleUpdateSuccess}
      />
      <EditAnggotaModal
        isOpen={!!anggotaToEdit}
        anggota={anggotaToEdit}
        onClose={() => setAnggotaToEdit(null)}
        onAnggotaUpdated={handleUpdateSuccess}
      />
      <DetailAnggotaModal
        isOpen={!!anggotaToView}
        anggota={anggotaToView}
        onClose={() => setAnggotaToView(null)}
      />
    </div>
  );
}