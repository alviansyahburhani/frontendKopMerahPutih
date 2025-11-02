// Lokasi: frontend/app/dashboard/admin/notulen-rapat-pengurus/page.tsx
"use client";

import {
  useState,
  useMemo,
  FormEvent,
  ChangeEvent,
  useEffect,
} from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import {
  PlusCircle,
  Search,
  FileText,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";
import {
  adminService,
  BoardMeetingNoteResponse,
  CreateBoardMeetingNoteDto,
  UpdateBoardMeetingNoteDto,
} from "@/services/admin.service";
import { ApiErrorResponse } from "@/types/api.types";

// ==============================
// 1. MODAL FORM (TAMBAH / EDIT)
// ==============================
type NotulenFormData = CreateBoardMeetingNoteDto;

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
  onSave: (data: NotulenFormData) => Promise<any>;
  initialData: NotulenFormData;
  title: string;
  submitText: string;
}) => {
  // ⬅️ penting: kalau nggak open, jangan render apa-apa
  if (!isOpen) return null;

  const [formData, setFormData] = useState<NotulenFormData>(initialData);
  const [loading, setLoading] = useState(false);

  // kalau initialData berubah (misal pindah dari add ke edit), isi ulang form
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData); // toast & tutup modal ditangani di parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tanggal Rapat*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  // initialData bisa dalam format "2025-11-01" atau "2025-11-01T00:00:00Z"
                  value={formData.date ? formData.date.split("T")[0] : ""}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lokasi Rapat*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="leader"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pimpinan Rapat*
                </label>
                <input
                  type="text"
                  id="leader"
                  name="leader"
                  required
                  value={formData.leader}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="totalAttendees"
                  className="block text-sm font-medium text-gray-700"
                >
                  Jumlah Hadir*
                </label>
                <input
                  type="number"
                  id="totalAttendees"
                  name="totalAttendees"
                  required
                  value={formData.totalAttendees}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="agenda"
                className="block text-sm font-medium text-gray-700"
              >
                Agenda Pembahasan*
              </label>
              <textarea
                id="agenda"
                name="agenda"
                rows={4}
                required
                value={formData.agenda}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-lg"
                placeholder="Tuliskan agenda rapat..."
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="decisions"
                className="block text-sm font-medium text-gray-700"
              >
                Hasil Keputusan*
              </label>
              <textarea
                id="decisions"
                name="decisions"
                rows={4}
                required
                value={formData.decisions}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-lg"
                placeholder="Tuliskan hasil keputusan rapat..."
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==============================
// 2. MODAL DETAIL
// ==============================
const DetailNotulenModal = ({
  isOpen,
  onClose,
  notulen,
}: {
  isOpen: boolean;
  onClose: () => void;
  notulen: BoardMeetingNoteResponse | null;
}) => {
  if (!isOpen || !notulen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Detail Notulen Rapat
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b pb-4">
            <div>
              <p className="text-gray-500">Tanggal Rapat</p>
              <p className="font-semibold">
                {new Date(notulen.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Lokasi Rapat</p>
              <p className="font-semibold">{notulen.location}</p>
            </div>
            <div>
              <p className="text-gray-500">Pimpinan Rapat</p>
              <p className="font-semibold">{notulen.leader}</p>
            </div>
            <div>
              <p className="text-gray-500">Jumlah Hadir</p>
              <p className="font-semibold">{notulen.totalAttendees} orang</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Agenda Pembahasan:
            </p>
            <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap font-sans">
              {notulen.agenda}
            </pre>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Hasil Keputusan:
            </p>
            <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap font-sans">
              {notulen.decisions}
            </pre>
          </div>

          <p className="text-xs text-gray-500 pt-4 border-t">
            Dicatat oleh: {notulen.notulenBy?.fullName || "N/A"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
          <Button type="button" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==============================
// 3. HALAMAN UTAMA
// ==============================
export default function NotulenRapatPengurusPage() {
  const [filters, setFilters] = useState({ search: "" });
  const [notulenList, setNotulenList] = useState<BoardMeetingNoteResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // state modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedNotulen, setSelectedNotulen] =
    useState<BoardMeetingNoteResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // load data
  const loadData = async () => {
    if (!loading) setLoading(true);
    try {
      const data = await adminService.getBoardMeetingNotes();
      // urutkan terbaru dulu
      data.sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNotulenList(data);
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const message = Array.isArray(apiError.message)
        ? apiError.message.join(", ")
        : apiError.message;
      toast.error(`Gagal memuat data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => setFilters({ search: "" });

  const filteredNotulen = useMemo(() => {
    return notulenList.filter((notulen) => {
      const searchTerm = filters.search.toLowerCase();
      return (
        notulen.agenda.toLowerCase().includes(searchTerm) ||
        notulen.location.toLowerCase().includes(searchTerm) ||
        notulen.leader.toLowerCase().includes(searchTerm)
      );
    });
  }, [notulenList, filters]);

  const handleOpenModal = (
    mode: "add" | "edit",
    notulen?: BoardMeetingNoteResponse
  ) => {
    setModalMode(mode);
    setSelectedNotulen(notulen || null);
    setIsModalOpen(true);
  };

  const handleSave = (data: NotulenFormData) => {
    let promise;
    if (modalMode === "add") {
      promise = adminService.createBoardMeetingNote(data);
    } else if (selectedNotulen) {
      promise = adminService.updateBoardMeetingNote(
        selectedNotulen.id,
        data as UpdateBoardMeetingNoteDto
      );
    } else {
      return Promise.reject(new Error("Aksi tidak valid"));
    }

    return toast.promise(promise, {
      loading: "Menyimpan notulen...",
      success: () => {
        loadData();
        setIsModalOpen(false);
        return `Notulen rapat di ${data.location} berhasil disimpan.`;
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        const message = Array.isArray(apiError.message)
          ? apiError.message.join(", ")
          : apiError.message;
        return `Gagal menyimpan: ${message}`;
      },
    });
  };

  const handleDelete = (id: string, location: string) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus notulen rapat di "${location}"?`
      )
    )
      return;

    const promise = adminService.deleteBoardMeetingNote(id);
    toast.promise(promise, {
      loading: "Menghapus notulen...",
      success: () => {
        loadData();
        return "Notulen berhasil dihapus.";
      },
      error: (err) => {
        const apiError = err as ApiErrorResponse;
        const message = Array.isArray(apiError.message)
          ? apiError.message.join(", ")
          : apiError.message;
        return `Gagal menghapus: ${message}`;
      },
    });
  };

  const handleLihatDetail = (notulen: BoardMeetingNoteResponse) => {
    setSelectedNotulen(notulen);
    setIsDetailModalOpen(true);
  };

  // data awal untuk tambah
  const initialDataForAdd: NotulenFormData = {
    date: new Date().toISOString().split("T")[0],
    location: "",
    leader: "",
    totalAttendees: 0,
    agenda: "",
    decisions: "",
    notulenSignatureUrl: undefined,
  };

  // data awal untuk edit
  const initialDataForEdit: NotulenFormData = {
    date: selectedNotulen
      ? new Date(selectedNotulen.date).toISOString().split("T")[0]
      : "",
    location: selectedNotulen?.location || "",
    leader: selectedNotulen?.leader || "",
    totalAttendees: selectedNotulen?.totalAttendees || 0,
    agenda: selectedNotulen?.agenda || "",
    decisions: selectedNotulen?.decisions || "",
    notulenSignatureUrl: selectedNotulen?.notulenSignatureUrl || undefined,
  };

  // skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const NotulenRapatPengurusSkeleton = () => (
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
            <div className="grow">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-5 bg-white"
              >
                <div className="border-b pb-3">
                  <Skeleton className="h-3 w-48 mb-2" />
                  <Skeleton className="h-5 w-64 mt-1" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </div>
                <div className="py-4">
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
    return <NotulenRapatPengurusSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" />

      <AdminPageHeader
        title="Buku Notulen Rapat Pengurus"
        description="Arsipkan dan kelola semua notulensi dari rapat internal pengurus."
        actionButton={
          <Button onClick={() => handleOpenModal("add")} variant="primary">
            <PlusCircle size={20} />
            <span>Tambah Notulen</span>
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* KOP */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Notulen Rapat Pengurus
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KOPERASI</span>
                <span className="text-gray-800 font-medium">
                  MERAH PUTIH JAYA
                </span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KAB / KOTA</span>
                <span className="text-gray-800 font-medium">KOTA MAKASSAR</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">
                  NO. BADAN HUKUM
                </span>
                <span className="text-gray-800 font-medium">
                  123/BH/IV.2/IX/2025
                </span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">
                  TANGGAL CETAK
                </span>
                <span className="text-gray-800 font-medium">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
            <div className="grow">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Cari Agenda / Lokasi / Pimpinan
              </label>
              <div className="relative">
                <input
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Ketik kata kunci..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={resetFilters} variant="outline">
              <X size={16} /> Reset
            </Button>
          </div>

          {/* LIST NOTULEN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotulen.length === 0 && (
              <div className="lg:col-span-2 text-center p-10 text-gray-500">
                {notulenList.length === 0
                  ? "Belum ada data notulen."
                  : "Tidak ada notulen yang sesuai filter."}
              </div>
            )}

            {filteredNotulen.map((notulen) => (
              <div
                key={notulen.id}
                className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition"
              >
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500">
                    {new Date(notulen.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="font-bold text-lg text-brand-red-700 mt-1">
                    Rapat di {notulen.location}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Dipimpin oleh: {notulen.leader} | Hadir:{" "}
                    {notulen.totalAttendees} orang
                  </p>
                </div>
                <div className="py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Agenda Utama:
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notulen.agenda}
                  </p>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button
                    onClick={() => handleLihatDetail(notulen)}
                    variant="outline"
                    className="text-xs px-3 py-1"
                  >
                    <FileText size={14} /> Lihat Detail
                  </Button>
                  <Button
                    onClick={() => handleOpenModal("edit", notulen)}
                    variant="outline"
                    className="text-xs px-3 py-1"
                  >
                    <Edit size={14} /> Edit
                  </Button>
                  <Button
                    onClick={() =>
                      handleDelete(notulen.id, notulen.location)
                    }
                    variant="outline"
                    className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT */}
      <NotulenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={modalMode === "add" ? "Tambah Notulen Baru" : "Edit Notulen Rapat"}
        submitText={modalMode === "add" ? "Simpan Notulen" : "Simpan Perubahan"}
        initialData={modalMode === "add" ? initialDataForAdd : initialDataForEdit}
      />

      {/* MODAL DETAIL */}
      <DetailNotulenModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        notulen={selectedNotulen}
      />
    </div>
  );
}
