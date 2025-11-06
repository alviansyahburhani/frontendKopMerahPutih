// Lokasi: frontend/app/dashboard/admin/anjuran-pejabat/page.tsx
"use client";

import {
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
  Edit2,
  X,
  CheckCircle,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";

// --- tipe & service dari backend ---
import {
  adminService,
  OfficialRecommendation,
  CreateOfficialRecommendationDto,
  RespondOfficialRecommendationDto,
} from "@/services/admin.service";
import { ApiErrorResponse } from "@/types/api.types";

// alias tipe
type AnjuranPejabat = OfficialRecommendation;

/* ==========================================================
   MODAL: Catat Anjuran Pejabat
========================================================== */
type AnjuranModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (anjuran: OfficialRecommendation) => void;
};

const AnjuranModal = ({ isOpen, onClose, onSave }: AnjuranModalProps) => {
  const [formData, setFormData] = useState<
    Omit<CreateOfficialRecommendationDto, "date">
  >({
    officialName: "",
    officialPositionAndAddress: "",
    recommendation: "",
  });
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        officialName: "",
        officialPositionAndAddress: "",
        recommendation: "",
      });
      setDate(new Date().toISOString().split("T")[0]);
      setFile(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Mencatat anjuran...");

    try {
      // konversi tanggal ke ISO
      const dto: CreateOfficialRecommendationDto = {
        ...formData,
        date: new Date(date).toISOString(),
      };

      const newAnjuran =
        await adminService.createOfficialRecommendation(dto);

      let finalAnjuran = newAnjuran;

      if (file) {
        toast.loading("Mengunggah dokumen...", { id: toastId });
        finalAnjuran = await adminService.uploadAnjuranDocument(
          newAnjuran.id,
          file
        );
      }

      toast.success("Anjuran berhasil dicatat!", { id: toastId });
      onSave(finalAnjuran);
      onClose();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal: ${apiError.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Catat Anjuran Pejabat Baru
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label
                htmlFor="officialName"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Pejabat*
              </label>
              <input
                type="text"
                id="officialName"
                name="officialName"
                required
                value={formData.officialName}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="officialPositionAndAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Jabatan & Alamat Instansi*
              </label>
              <input
                type="text"
                id="officialPositionAndAddress"
                name="officialPositionAndAddress"
                required
                value={formData.officialPositionAndAddress}
                onChange={handleChange}
                disabled={loading}
                placeholder="Contoh: Kepala Dinas Koperasi, Jl. Veteran..."
                className="mt-1 w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Tanggal Diterima/Dicatat*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className="mt-1 w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="recommendation"
                className="block text-sm font-medium text-gray-700"
              >
                Isi Anjuran*
              </label>
              <textarea
                id="recommendation"
                name="recommendation"
                rows={4}
                required
                value={formData.recommendation}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700"
              >
                Unggah Dokumen (Opsional)
              </label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                disabled={loading}
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unggah scan surat/dokumen anjuran jika ada (Kolom 6).
              </p>
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
              {loading ? <Loader2 className="animate-spin" /> : "Simpan Anjuran"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   MODAL: Tanggapi Anjuran
========================================================== */
type RespondModalProps = {
  anjuran: AnjuranPejabat | null;
  onClose: () => void;
  onSave: (updatedAnjuran: AnjuranPejabat) => void;
};

const RespondModal = ({ anjuran, onClose, onSave }: RespondModalProps) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (anjuran) {
      setResponse(anjuran.response || "");
    }
  }, [anjuran]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!anjuran || !response.trim()) {
      toast.error("Tanggapan tidak boleh kosong.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Mengirim tanggapan...");
    const dto: RespondOfficialRecommendationDto = { response };

    try {
      const updatedAnjuran = await adminService.respondToRecommendation(
        anjuran.id,
        dto
      );
      toast.success("Tanggapan berhasil disimpan!", { id: toastId });
      onSave(updatedAnjuran);
      onClose();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal: ${apiError.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!anjuran) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Beri Tanggapan</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-sm font-medium text-gray-500">
                Anjuran dari: {anjuran.officialName}
              </p>
              <p className="text-sm text-gray-700 mt-2 italic">
                “{anjuran.recommendation}”
              </p>
            </div>
            <div>
              <label
                htmlFor="response"
                className="block text-sm font-medium text-gray-700"
              >
                Tanggapan Pengurus (Kolom 7)*
              </label>
              <textarea
                id="response"
                name="response"
                rows={4}
                required
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={loading}
                className="mt-1 w-full p-2 border rounded-lg"
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
              {loading ? <Loader2 className="animate-spin" /> : "Simpan Tanggapan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   SKELETON
========================================================== */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
);

const AnjuranPejabatSkeleton = () => (
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-4 w-64 mb-1" />
                    <Skeleton className="h-3 w-48 mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </div>
              <div className="p-4 bg-green-50 border-t border-green-200 rounded-b-lg">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ==========================================================
   HALAMAN UTAMA
========================================================== */
export default function AnjuranPejabatPage() {
  const [filters, setFilters] = useState({ search: "" });
  const [anjuranList, setAnjuranList] = useState<AnjuranPejabat[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [anjuranToRespond, setAnjuranToRespond] =
    useState<AnjuranPejabat | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAllOfficialRecommendations();
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAnjuranList(data);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        toast.error(
          `Gagal memuat data: ${apiError.message || "Error tidak diketahui"}`
        );
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => setFilters({ search: "" });

  const filteredAnjuran = useMemo(() => {
    return anjuranList.filter(
      (anjuran) =>
        anjuran.officialName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        anjuran.recommendation
          .toLowerCase()
          .includes(filters.search.toLowerCase())
    );
  }, [anjuranList, filters]);

  const handleTambahAnjuran = () => setIsCreateModalOpen(true);

  const handleSaveNew = (newAnjuran: AnjuranPejabat) => {
    setAnjuranList((prev) => [newAnjuran, ...prev]);
  };

  const handleSaveResponse = (updatedAnjuran: AnjuranPejabat) => {
    setAnjuranList((prev) =>
      prev.map((item) =>
        item.id === updatedAnjuran.id ? updatedAnjuran : item
      )
    );
  };

  const handleDelete = (id: string, namaPejabat: string) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus anjuran dari "${namaPejabat}"?`
      )
    )
      return;

    const promise = adminService.deleteOfficialRecommendation(id);
    toast.promise(promise, {
      loading: "Menghapus...",
      success: () => {
        setAnjuranList((prev) => prev.filter((item) => item.id !== id));
        return "Anjuran berhasil dihapus.";
      },
      error: (err: ApiErrorResponse) => `Gagal: ${err.message}`,
    });
  };

  if (loading) {
    return <AnjuranPejabatSkeleton />;
  }

  return (
    <div>
      <Toaster position="top-right" />
      <AdminPageHeader
        title="Buku Anjuran Pejabat"
        description="Arsipkan semua anjuran dan instruksi resmi dari pejabat terkait."
        actionButton={
          <Button onClick={handleTambahAnjuran} variant="primary">
            <PlusCircle size={20} />
            <span>Catat Anjuran Baru</span>
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Anjuran Pejabat
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
                <span className="text-gray-800 font-medium">
                  KOTA MAKASSAR
                </span>
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

        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
            <div className="grow">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Cari Anjuran / Nama Pejabat
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

          <div className="space-y-4">
            {filteredAnjuran.map((anjuran) => (
              <div key={anjuran.id} className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">
                        Dari: {anjuran.officialName}
                      </p>
                      <p className="text-sm text-gray-600">
                        ({anjuran.officialPositionAndAddress})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dicatat pada:{" "}
                        {new Date(anjuran.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!anjuran.response && (
                        <Button
                          variant="outline"
                          className="text-xs p-2"
                          onClick={() => setAnjuranToRespond(anjuran)}
                        >
                          <Edit2 size={14} /> Beri Tanggapan
                        </Button>
                      )}
                      {anjuran.documentUrl && (
                        <a
                          href={anjuran.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            className="text-xs p-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <FileText size={14} /> Dokumen
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() =>
                          handleDelete(anjuran.id, anjuran.officialName)
                        }
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-4 border-l-4 border-gray-200 pl-4 py-2">
                    {anjuran.recommendation}
                  </p>
                </div>
                {anjuran.response && (
                  <div className="p-4 bg-green-50 border-t border-green-200 rounded-b-lg">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Tanggapan dari:{" "}
                      {anjuran.responseByUser?.fullName || "Pengurus"}
                    </p>
                    <p className="text-sm text-green-700 mt-2 italic">
                      “{anjuran.response}”
                    </p>
                  </div>
                )}
              </div>
            ))}
            {filteredAnjuran.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                Tidak ada data anjuran yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnjuranModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNew}
      />

      <RespondModal
        anjuran={anjuranToRespond}
        onClose={() => setAnjuranToRespond(null)}
        onSave={handleSaveResponse}
      />
    </div>
  );
}
