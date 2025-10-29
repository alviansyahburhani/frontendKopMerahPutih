"use client";

import { useState, useMemo, FormEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, Edit, Trash2, XCircle } from "lucide-react";
import clsx from "clsx";

// Tipe Data disesuaikan dengan semua kolom di file Excel "Buku Daftar Pengawas"
type Pengawas = {
  no: number;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  pekerjaan: string;
  alamat: string;
  nomorKeanggotaan: string;
  jabatan: string;
  tanggalDiangkat: string; // Format YYYY-MM-DD
  tanggalBerhenti: string | null; // Format YYYY-MM-DD atau null
  alasanBerhenti?: string;
};

// Data contoh disesuaikan
const mockPengawas: Pengawas[] = [
  { no: 1, namaLengkap: "Rahmat Hidayat", tempatLahir: "Yogyakarta", tanggalLahir: "1975-08-17", jenisKelamin: "Laki-laki", pekerjaan: "Dosen", alamat: "Jl. Pendidikan No. 20", nomorKeanggotaan: "AGT-005", jabatan: "Ketua Pengawas", tanggalDiangkat: "2024-01-10", tanggalBerhenti: null },
  { no: 2, namaLengkap: "Kartika Sari", tempatLahir: "Semarang", tanggalLahir: "1980-04-21", jenisKelamin: "Perempuan", pekerjaan: "Konsultan", alamat: "Jl. Cendana No. 5", nomorKeanggotaan: "AGT-006", jabatan: "Anggota Pengawas", tanggalDiangkat: "2024-01-10", tanggalBerhenti: null },
  { no: 3, namaLengkap: "Joko Prasetyo", tempatLahir: "Solo", tanggalLahir: "1978-12-10", jenisKelamin: "Laki-laki", pekerjaan: "PNS", alamat: "Jl. Melati No. 1", nomorKeanggotaan: "AGT-007", jabatan: "Anggota Pengawas", tanggalDiangkat: "2024-01-10", tanggalBerhenti: "2025-08-15", alasanBerhenti: "Pensiun" },
];


// ===================================================================
// KOMPONEN MODAL UNTUK TAMBAH PENGAWAS
// ===================================================================
const TambahPengawasModal = ({ onClose, onPengawasAdded }: { onClose: () => void; onPengawasAdded: (pengawas: Pengawas) => void; }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPengawas: Pengawas = {
      no: Math.floor(Math.random() * 1000),
      namaLengkap: formData.get("namaLengkap") as string,
      tempatLahir: formData.get("tempatLahir") as string,
      tanggalLahir: formData.get("tanggalLahir") as string,
      jenisKelamin: formData.get("jenisKelamin") as string,
      pekerjaan: formData.get("pekerjaan") as string,
      alamat: formData.get("alamat") as string,
      nomorKeanggotaan: formData.get("nomorKeanggotaan") as string,
      jabatan: formData.get("jabatan") as string,
      tanggalDiangkat: formData.get("tanggalDiangkat") as string,
      tanggalBerhenti: null,
    };
    alert(`Pengawas baru "${newPengawas.namaLengkap}" berhasil ditambahkan.`);
    onPengawasAdded(newPengawas);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Form Tambah Pengawas Baru</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label><input type="text" name="namaLengkap" id="namaLengkap" required className="mt-1 w-full p-2 border rounded-md"/></div>
                <div><label htmlFor="nomorKeanggotaan" className="block text-sm font-medium text-gray-700">Nomor Keanggotaan*</label><input type="text" name="nomorKeanggotaan" id="nomorKeanggotaan" required className="mt-1 w-full p-2 border rounded-md"/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label><input type="text" name="tempatLahir" id="tempatLahir" required className="mt-1 w-full p-2 border rounded-md"/></div>
                <div><label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label><input type="date" name="tanggalLahir" id="tanggalLahir" required className="mt-1 w-full p-2 border rounded-md"/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label><select name="jenisKelamin" id="jenisKelamin" required className="mt-1 w-full p-2 border rounded-md"><option value="">Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                <div><label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label><input type="text" name="pekerjaan" id="pekerjaan" required className="mt-1 w-full p-2 border rounded-md"/></div>
            </div>
            <div><label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label><textarea name="alamat" id="alamat" rows={2} required className="mt-1 w-full p-2 border rounded-md"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div><label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan Pengawas*</label><input type="text" name="jabatan" id="jabatan" placeholder="Contoh: Ketua Pengawas" required className="mt-1 w-full p-2 border rounded-md"/></div>
                <div><label htmlFor="tanggalDiangkat" className="block text-sm font-medium text-gray-700">Tanggal Diangkat*</label><input type="date" name="tanggalDiangkat" id="tanggalDiangkat" required className="mt-1 w-full p-2 border rounded-md"/></div>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
                <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                <Button type="submit">Simpan Pengawas</Button>
            </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL UNTUK EDIT PENGAWAS
// ===================================================================
const EditPengawasModal = ({ pengawas, onClose, onPengawasUpdated }: { pengawas: Pengawas; onClose: () => void; onPengawasUpdated: (updatedPengawas: Pengawas) => void; }) => {
    const [formData, setFormData] = useState(pengawas);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onPengawasUpdated(formData);
        alert(`Data pengawas "${formData.namaLengkap}" berhasil diperbarui.`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Edit Data Pengawas</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label><input type="text" name="namaLengkap" id="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/></div>
                        <div><label htmlFor="nomorKeanggotaan" className="block text-sm font-medium text-gray-700">Nomor Keanggotaan*</label><input type="text" name="nomorKeanggotaan" id="nomorKeanggotaan" required value={formData.nomorKeanggotaan} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/></div>
                    </div>
                    {/* ... form fields lainnya disesuaikan seperti di atas ... */}
                     <div>
                        <label htmlFor="tanggalBerhenti" className="block text-sm font-medium text-gray-700">Tanggal Berhenti</label>
                        <input type="date" name="tanggalBerhenti" id="tanggalBerhenti" value={formData.tanggalBerhenti || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="alasanBerhenti" className="block text-sm font-medium text-gray-700">Alasan Berhenti</label>
                        <textarea name="alasanBerhenti" id="alasanBerhenti" rows={2} value={formData.alasanBerhenti || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                    </div>
                    <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">Simpan Perubahan</Button>
                    </div>
                </form>
             </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL UNTUK DETAIL PENGAWAS
// ===================================================================
const DetailPengawasModal = ({ pengawas, onClose }: { pengawas: Pengawas; onClose: () => void; }) => {
    const dataPribadi = [
        { label: "Nama Lengkap", value: pengawas.namaLengkap },
        { label: "Nomor Keanggotaan", value: pengawas.nomorKeanggotaan },
        { label: "Tempat, Tanggal Lahir", value: `${pengawas.tempatLahir}, ${new Date(pengawas.tanggalLahir).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}` },
        { label: "Jenis Kelamin", value: pengawas.jenisKelamin },
        { label: "Pekerjaan", value: pengawas.pekerjaan },
        { label: "Alamat", value: pengawas.alamat },
    ];
    const dataJabatan = [
        { label: "Jabatan", value: pengawas.jabatan },
        { label: "Tanggal Diangkat", value: new Date(pengawas.tanggalDiangkat).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) },
        { label: "Tanggal Berhenti", value: pengawas.tanggalBerhenti ? new Date(pengawas.tanggalBerhenti).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) : "Masih Aktif" },
        { label: "Alasan Berhenti", value: pengawas.alasanBerhenti || "-" },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Detail Pengawas</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button></div>
            <div className="p-6 overflow-y-auto space-y-6">
                <div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataPribadi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl></div>
                <div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Informasi Jabatan</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataJabatan.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl></div>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button></div>
          </div>
        </div>
    );
};


// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function DaftarPengawasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTambahModalOpen, setTambahModalOpen] = useState(false);
  const [pengawasToEdit, setPengawasToEdit] = useState<Pengawas | null>(null);
  const [pengawasToView, setPengawasToView] = useState<Pengawas | null>(null);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setPengawasList(mockPengawas);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPengawas = useMemo(() => {
    if (!searchTerm) return pengawasList;
    return pengawasList.filter(p => p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, pengawasList]);

  const handleHapus = (nama: string, id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pengawas "${nama}"?`)) {
        setPengawasList(prev => prev.filter(p => p.no !== id));
        alert(`Pengawas "${nama}" telah dihapus (simulasi).`);
    }
  };

  const handleUpdatePengawas = (updatedPengawas: Pengawas) => {
    setPengawasList(prev => prev.map(p => p.no === updatedPengawas.no ? updatedPengawas : p));
  };

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const DaftarPengawasSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-1/2 mx-auto text-center" />
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-40 ml-4" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-12" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                  <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b text-sm">
                    <td className="p-4 font-medium"><Skeleton className="h-4 w-8" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
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

  if (loading) {
    return <DaftarPengawasSkeleton />;
  }

  return (
    <div>
      <div className="mb-6">
        <AdminPageHeader
          title="Manajemen Pengawas"
          description="Kelola data pengawas koperasi sesuai buku daftar pengawas."
          actionButton={<Button onClick={() => setTambahModalOpen(true)}><PlusCircle size={20} /><span>Tambah Pengawas</span></Button>}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Pengawas</h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2"><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span></div><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">KOTA MAKASSAR</span></div></div>
            <div className="space-y-2"><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span></div><div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL</span><span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div></div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
                <input type="text" placeholder="Cari pengawas..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">No.</th>
                  <th className="p-4 font-medium">Nama Lengkap</th>
                  <th className="p-4 font-medium">No. Anggota</th>
                  <th className="p-4 font-medium">Jabatan</th>
                  <th className="p-4 font-medium">Tanggal Diangkat</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPengawas.map((pengawas) => (
                  <tr key={pengawas.no} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                    <td className="p-4 font-medium">{pengawas.no}.</td>
                    <td className="p-4">{pengawas.namaLengkap}</td>
                    <td className="p-4">{pengawas.nomorKeanggotaan}</td>
                    <td className="p-4">{pengawas.jabatan}</td>
                    <td className="p-4">{new Date(pengawas.tanggalDiangkat).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                    <td className="p-4 text-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${!pengawas.tanggalBerhenti ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {!pengawas.tanggalBerhenti ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => setPengawasToView(pengawas)} className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200" title="Lihat Detail"><Eye size={20} /></button>
                      <button onClick={() => setPengawasToEdit(pengawas)} className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200" title="Edit Pengawas"><Edit size={20} /></button>
                      {pengawas.tanggalBerhenti && <button onClick={() => handleHapus(pengawas.namaLengkap, pengawas.no)} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200" title="Hapus Data"><Trash2 size={20} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {isTambahModalOpen && <TambahPengawasModal onClose={() => setTambahModalOpen(false)} onPengawasAdded={(newPengawas) => setPengawasList(prev => [...prev, newPengawas])} />}
      {pengawasToEdit && <EditPengawasModal pengawas={pengawasToEdit} onClose={() => setPengawasToEdit(null)} onPengawasUpdated={handleUpdatePengawas} />}
      {pengawasToView && <DetailPengawasModal pengawas={pengawasToView} onClose={() => setPengawasToView(null)} />}
    </div>
  );
}