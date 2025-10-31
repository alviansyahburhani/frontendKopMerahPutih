// Lokasi: app/dashboard/admin/daftar-pengawas/page.tsx
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import {
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
// [PERUBAHAN] Impor tipe dan DTO dari service, bukan didefinisikan di sini
import {
  adminService,
  SupervisoryPosition,
  MemberWithRole,
  CreateSupervisoryPositionDto,
  UpdateSupervisoryPositionDto,
} from "@/services/admin.service";
import { ApiErrorResponse } from "@/types/api.types";

/* ============================================================
    TIPE DATA UI
============================================================ */
// Tipe PengawasUI tetap di sini karena ini adalah tipe data
// spesifik untuk tampilan halaman ini (gabungan dari 2 sumber data)
type PengawasUI = {
  id: string; // id dari tabel supervisory_positions
  no: number;
  memberId: string;
  namaLengkap: string;
  nomorKeanggotaan: string;
  nik?: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  pekerjaan: string;
  alamat: string;
  phoneNumber?: string;
  email?: string;
  jabatan: string;
  tanggalDiangkat: string;
  tanggalBerhenti: string | null;
  alasanBerhenti?: string | null;
};

/* ============================================================
    HELPER: gabungkan data dari /supervisory-positions + /members
============================================================ */
// Helper ini juga tetap di sini
function buildPengawasUI(
  supervisory: SupervisoryPosition[],
  members: MemberWithRole[]
): PengawasUI[] {
  return supervisory.map((sp, idx) => {
    const m = members.find((mm) => mm.id === sp.memberId);

    return {
      id: sp.id,
      no: idx + 1,
      memberId: sp.memberId,
      namaLengkap: m?.fullName ?? sp.member?.fullName ?? "-",
      nomorKeanggotaan: m?.memberNumber ?? sp.member?.memberNumber ?? "-",
      nik: m?.nik,
      tempatLahir: m?.placeOfBirth ?? sp.member?.placeOfBirth ?? "-",
      tanggalLahir: m?.dateOfBirth ?? sp.member?.dateOfBirth ?? "",
      jenisKelamin:
        m?.gender === "MALE"
          ? "Laki-laki"
          : m?.gender === "FEMALE"
          ? "Perempuan"
          : sp.member?.gender === "MALE"
          ? "Laki-laki"
          : sp.member?.gender === "FEMALE"
          ? "Perempuan"
          : "-",
      pekerjaan: m?.occupation ?? sp.member?.occupation ?? "-",
      alamat: m?.address ?? sp.member?.address ?? "-",
      phoneNumber: m?.phoneNumber,
      email: m?.email,
      jabatan: sp.jabatan,
      tanggalDiangkat: sp.tanggalDiangkat,
      tanggalBerhenti: sp.tanggalBerhenti ?? null,
      alasanBerhenti: sp.alasanBerhenti ?? null,
    };
  });
}

/* ============================================================
    MODAL: TAMBAH PENGAWAS
============================================================ */
const TambahPengawasModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void; // setelah sukses → parent akan refetch
}) => {
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [tanggalDiangkat, setTanggalDiangkat] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  // ambil daftar anggota
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const data = await adminService.getAllMembers();
        const aktif = data.filter((m) => m.status === "ACTIVE");
        setMembers(aktif);
      } catch (err) {
        const apiErr = err as ApiErrorResponse;
        setError(apiErr.message || "Gagal memuat daftar anggota");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    if (!searchMember) return members;
    const q = searchMember.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.memberNumber ?? "").toLowerCase().includes(q) ||
        (m.nik ?? "").toLowerCase().includes(q)
    );
  }, [members, searchMember]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert("Pilih anggota yang akan dijadikan Pengawas.");
      return;
    }
    if (!jabatan) {
      alert("Isi jabatan pengawas.");
      return;
    }
    if (!tanggalDiangkat) {
      alert("Isi tanggal diangkat.");
      return;
    }

    const dto: CreateSupervisoryPositionDto = {
      memberId: selectedMemberId,
      jabatan,
      tanggalDiangkat,
    };

    try {
      setLoading(true);
      await adminService.createSupervisoryPosition(dto);
      // selesai → serahkan ke parent untuk refetch
      onSuccess();
      onClose();
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      alert(apiErr.message || "Gagal menambah pengawas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Form Tambah Pengawas Baru
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Anggota*
            </label>
            {loadingMembers ? (
              <p className="text-sm text-gray-500">Memuat anggota...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <>
                <input
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Cari nama / no anggota / NIK ..."
                  className="w-full p-2 border rounded-md mb-2"
                />
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">-- Pilih Anggota --</option>
                  {filteredMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                      {m.memberNumber ? ` (${m.memberNumber})` : ""}
                      {m.user?.role?.name ? ` - ${m.user.role.name}` : ""}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jabatan Pengawas*
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Contoh: Ketua Pengawas"
                className="mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Diangkat*
              </label>
              <input
                type="date"
                value={tanggalDiangkat}
                onChange={(e) => setTanggalDiangkat(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Pengawas"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================
    MODAL: EDIT PENGAWAS (PATCH)
============================================================ */
const EditPengawasModal = ({
  pengawas,
  onClose,
  onSuccess,
}: {
  pengawas: PengawasUI;
  onClose: () => void;
  onSuccess: () => void; // habis update → refetch
}) => {
  const [formData, setFormData] = useState<PengawasUI>(pengawas);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "tanggalBerhenti" && value === "" ? null : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const dto: UpdateSupervisoryPositionDto = {
      jabatan: formData.jabatan,
      tanggalDiangkat: formData.tanggalDiangkat,
      tanggalBerhenti: formData.tanggalBerhenti,
      alasanBerhenti: formData.alasanBerhenti,
    };

    try {
      setLoading(true);
      await adminService.updateSupervisoryPosition(formData.id, dto);
      onSuccess(); // parent refetch
      onClose();
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      alert(apiErr.message || "Gagal mengupdate pengawas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Data Pengawas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.namaLengkap}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nomor Keanggotaan
              </label>
              <input
                type="text"
                value={formData.nomorKeanggotaan}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jabatan
              </label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Diangkat
              </label>
              <input
                type="date"
                name="tanggalDiangkat"
                value={formData.tanggalDiangkat?.slice(0, 10) ?? ""}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Berhenti
            </label>
            <input
              type="date"
              name="tanggalBerhenti"
              value={formData.tanggalBerhenti ?? ""}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alasan Berhenti
            </label>
            <textarea
              name="alasanBerhenti"
              value={formData.alasanBerhenti ?? ""}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full p-2 border rounded-md"
            />
          </div>

          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================
    MODAL: DETAIL
============================================================ */
const DetailPengawasModal = ({
  pengawas,
  onClose,
}: {
  pengawas: PengawasUI;
  onClose: () => void;
}) => {
  const dataPribadi = [
    { label: "Nama Lengkap", value: pengawas.namaLengkap },
    { label: "NIK", value: pengawas.nik || "-" },
    { label: "Nomor Keanggotaan", value: pengawas.nomorKeanggotaan },
    {
      label: "Tempat, Tanggal Lahir",
      value: pengawas.tanggalLahir
        ? `${pengawas.tempatLahir}, ${new Date(
            pengawas.tanggalLahir
          ).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}`
        : pengawas.tempatLahir,
    },
    { label: "Jenis Kelamin", value: pengawas.jenisKelamin },
    { label: "Pekerjaan", value: pengawas.pekerjaan },
    { label: "Alamat", value: pengawas.alamat },
    { label: "No. HP", value: pengawas.phoneNumber || "-" },
    { label: "Email", value: pengawas.email || "-" },
  ];

  const dataJabatan = [
    { label: "Jabatan", value: pengawas.jabatan },
    {
      label: "Tanggal Diangkat",
      value: new Date(pengawas.tanggalDiangkat).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    },
    {
      label: "Tanggal Berhenti",
      value: pengawas.tanggalBerhenti
        ? new Date(pengawas.tanggalBerhenti).toLocaleDateString(
            "id-ID",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )
        : "Masih Aktif",
    },
    { label: "Alasan Berhenti", value: pengawas.alasanBerhenti || "-" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Detail Pengawas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-red-600 mb-2">Data Pribadi</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {dataPribadi.map((item) => (
                <div key={item.label}>
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-red-600 mb-2">
              Informasi Jabatan
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {dataJabatan.map((item) => (
                <div key={item.label}>
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
    SKELETON
============================================================ */
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
                <th className="p-4 font-medium">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="p-4 font-medium">
                  <Skeleton className="h-4 w-32" />
                </th>
                <th className="p-4 font-medium">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="p-4 font-medium">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="p-4 font-medium">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="p-4 font-medium text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
                <th className="p-4 font-medium text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b text-sm">
                  <td className="p-4 font-medium">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-4 text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="p-4 text-center">
                    <Skeleton className="h-8 w-24 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================
    HALAMAN UTAMA
============================================================ */
export default function DaftarPengawasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pengawasList, setPengawasList] = useState<PengawasUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTambahModalOpen, setTambahModalOpen] = useState(false);
  const [pengawasToEdit, setPengawasToEdit] = useState<PengawasUI | null>(null);
  const [pengawasToView, setPengawasToView] = useState<PengawasUI | null>(null);
  const [error, setError] = useState<string | null>(null);

  // fungsi refetch supaya bisa dipakai tambah/edit/hapus
  const refetchPengawas = async () => {
    try {
      setLoading(true);
      const [supv, members] = await Promise.all([
        adminService.getAllSupervisoryPositions(),
        adminService.getAllMembers(),
      ]);
      const ui = buildPengawasUI(supv, members);
      setPengawasList(ui);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      setError(apiErr.message || "Gagal memuat data pengawas");
    } finally {
      setLoading(false);
    }
  };

  // load awal
  useEffect(() => {
    void refetchPengawas();
  }, []);

  const filteredPengawas = useMemo(() => {
    if (!searchTerm) return pengawasList;
    const q = searchTerm.toLowerCase();
    return pengawasList.filter(
      (p) =>
        p.namaLengkap.toLowerCase().includes(q) ||
        (p.nomorKeanggotaan ?? "").toLowerCase().includes(q) ||
        (p.nik ?? "").toLowerCase().includes(q)
    );
  }, [searchTerm, pengawasList]);

  const handleHapus = async (pengawas: PengawasUI) => {
    const ok = window.confirm(
      `Apakah Anda yakin ingin memberhentikan pengawas "${pengawas.namaLengkap}"?`
    );
    if (!ok) return;
    try {
      await adminService.terminateSupervisoryPosition(pengawas.id);
      await refetchPengawas();
      alert("Pengawas berhasil diberhentikan.");
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      alert(apiErr.message || "Gagal memberhentikan pengawas");
    }
  };

  if (loading) {
    return <DaftarPengawasSkeleton />;
  }

  return (
    <div>
      <div className="mb-6">
        <AdminPageHeader
          title="Manajemen Pengawas"
          description="Kelola data pengawas koperasi. Identitas diambil dari master anggota (/members)."
          actionButton={
            <Button onClick={() => setTambahModalOpen(true)}>
              <PlusCircle size={20} />
              <span>Tambah Pengawas</span>
            </Button>
          }
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Pengawas
          </h2>
          <p className="text-center text-xs text-gray-500 mt-2">
            Data jabatan diambil dari /supervisory-positions, identitas dari /members
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Cari nama / no anggota / NIK ..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">No.</th>
                  <th className="p-4 font-medium">Nama Lengkap</th>
                  <th className="p-4 font-medium">NIK</th>
                  <th className="p-4 font-medium">No. Anggota</th>
                  <th className="p-4 font-medium">Jabatan</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPengawas.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-red-50 text-sm transition-colors duration-150"
                  >
                    <td className="p-4 font-medium">{p.no}.</td>
                    <td className="p-4">{p.namaLengkap}</td>
                    <td className="p-4">{p.nik || "-"}</td>
                    <td className="p-4">{p.nomorKeanggotaan}</td>
                    <td className="p-4">{p.jabatan}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          !p.tanggalBerhenti
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {!p.tanggalBerhenti ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => setPengawasToView(p)}
                        className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
                        title="Lihat Detail"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => setPengawasToEdit(p)}
                        className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                        title="Edit Pengawas"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleHapus(p)}
                        className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                        title="Hentikan Pengawas"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPengawas.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-gray-400 text-sm"
                    >
                      Tidak ada data pengawas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isTambahModalOpen && (
        <TambahPengawasModal
          onClose={() => setTambahModalOpen(false)}
          onSuccess={refetchPengawas}
        />
      )}

      {pengawasToEdit && (
        <EditPengawasModal
          pengawas={pengawasToEdit}
          onClose={() => setPengawasToEdit(null)}
          onSuccess={refetchPengawas}
        />
      )}

      {pengawasToView && (
        <DetailPengawasModal
          pengawas={pengawasToView}
          onClose={() => setPengawasToView(null)}
        />
      )}
    </div>
  );
}