// Lokasi: lib/buku-data.ts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BookUser, PiggyBank, HandCoins, ClipboardList, Briefcase, Users, UserCheck, Inbox, FileText, Package, AlertTriangle, Mail, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Tipe data untuk satu halaman fitur
export interface BukuFitur {
  slug: string;
  nomorBuku: string;
  namaBuku: string;
  deskripsiSingkat: string;
  gambarHero: string; // Path ke gambar, misal: /images/fitur/buku-anggota.png
  manfaat: {
    icon: LucideIcon;
    judul: string;
    poin: string;
  }[];
  detailFitur: {
    judul: string;
    poin: string[];
  };
}

// Data untuk semua 16 buku
// Kunci (e.g., 'buku-anggota') harus sesuai dengan link di 'MainDomainFeatures'
export const BUKU_DATA: Record<string, BukuFitur> = {
  
  'buku-anggota': {
    slug: 'buku-anggota',
    nomorBuku: "Buku 01",
    namaBuku: "Buku Daftar Anggota",
    deskripsiSingkat: "Digitalisasi lengkap data induk anggota, dari pendaftaran hingga pemberhentian, secara terpusat dan aman.",
    gambarHero: "/images/fitur/fitur-anggota.png", // Anda harus siapkan gambar ini
    manfaat: [
      { icon: BookUser, judul: "Data Terpusat", poin: "Semua data pribadi, pekerjaan, dan status anggota tersimpan rapi." },
      { icon: UserCheck, judul: "Persetujuan Online", poin: "Proses persetujuan anggota baru langsung dari dashboard admin." },
      { icon: Briefcase, judul: "Manajemen Jabatan", poin: "Kelola siapa saja yang menjabat sebagai Pengurus dan Pengawas." }
    ],
    detailFitur: {
      judul: "Pencatatan Sesuai Standar",
      poin: [
        "Nama Lengkap, NIK, TTL, Jenis Kelamin",
        "Pekerjaan dan Alamat Lengkap",
        "Tanggal Masuk Menjadi Anggota",
        "Pencatatan Tanda Tangan Digital",
        "Pencatatan Tanggal & Alasan Berhenti",
        "Integrasi dengan Akun Login Anggota"
      ]
    }
  },
  
  'buku-simpanan': {
    slug: 'buku-simpanan',
    nomorBuku: "Buku 04",
    namaBuku: "Buku Simpanan Anggota",
    deskripsiSingkat: "Kelola semua jenis simpanan (Pokok, Wajib, Sukarela) dengan transparan dan akurat.",
    gambarHero: "/images/fitur/fitur-simpanan.png", // Anda harus siapkan gambar ini
    manfaat: [
      { icon: PiggyBank, judul: "Tiga Jenis Simpanan", poin: "Mendukung pencatatan Simpanan Pokok, Wajib, dan Sukarela secara terpisah." },
      { icon: ClipboardList, judul: "Riwayat Transaksi", poin: "Anggota dapat melihat riwayat setoran dan penarikan mereka kapan saja." },
      { icon: FileText, judul: "Laporan Otomatis", poin: "Sistem otomatis menghitung total saldo setiap anggota dan keseluruhan." }
    ],
    detailFitur: {
      judul: "Fitur Lengkap Administrasi Simpanan",
      poin: [
        "Pencatatan Tanggal dan Nomor Bukti",
        "Kolom Uraian Transaksi",
        "Pemisahan kolom Pokok, Wajib, dan Sukarela",
        "Perhitungan jumlah total otomatis",
        "Integrasi dengan dashboard anggota"
      ]
    }
  },

  'buku-pinjaman': {
    slug: 'buku-pinjaman',
    nomorBuku: "Buku 05",
    namaBuku: "Buku Daftar Pinjaman Anggota",
    deskripsiSingkat: "Administrasi siklus pinjaman anggota, dari pengajuan, pencairan, hingga pemantauan angsuran.",
    gambarHero: "/images/fitur/fitur-pinjaman.png", // Anda harus siapkan gambar ini
    manfaat: [
      { icon: HandCoins, judul: "Manajemen Pinjaman", poin: "Catat plafon, bunga, dan jangka waktu untuk setiap pinjaman." },
      { icon: Users, judul: "Dashboard Anggota", poin: "Anggota dapat melihat sisa tagihan dan riwayat angsuran mereka." },
      { icon: AlertTriangle, judul: "Status Pinjaman", poin: "Monitor pinjaman yang berstatus Aktif, Lunas, atau Menunggak." }
    ],
    detailFitur: {
      judul: "Pencatatan Pinjaman Terperinci",
      poin: [
        "Data Peminjam (Nama, Alamat, Pekerjaan)",
        "Nomor Perjanjian dan Alasan Meminjam",
        "Pencatatan Tanggal Realisasi Pinjaman",
        "Pencatatan Tanggal Jatuh Tempo Lunas",
        "Kolom Pokok Pinjaman, Bunga, dan Jumlah",
        "Perhitungan otomatis Sisa Pinjaman"
      ]
    }
  },

  'buku-notulen': {
    slug: 'buku-notulen',
    nomorBuku: "Buku 07, 08, 09",
    namaBuku: "Buku Notulen Rapat",
    deskripsiSingkat: "Arsipkan semua notulen rapat (Anggota, Pengurus, Pengawas) secara digital, aman, dan mudah dicari.",
    gambarHero: "/images/fitur/fitur-notulen.png", // Anda harus siapkan gambar ini
    manfaat: [
      { icon: ClipboardList, judul: "Tiga Jenis Rapat", poin: "Pisahkan notulen untuk Rapat Anggota, Rapat Pengurus, dan Rapat Pengawas." },
      { icon: Inbox, judul: "Arsip Digital", poin: "Unggah dokumen scan/PDF notulen sebagai lampiran bukti rapat." },
      { icon: MessageSquare, judul: "Transparansi", poin: "Anggota dapat mengakses notulen Rapat Anggota melalui dashboard mereka." }
    ],
    detailFitur: {
      judul: "Pencatatan Rapat Sesuai Standar",
      poin: [
        "Pencatatan Hari, Tanggal, dan Tempat Rapat",
        "Data Pimpinan Rapat dan Jumlah Kehadiran",
        "Pencatatan Sifat Rapat (RAT, RALB, Rutin, dll)",
        "Kolom khusus untuk Materi Rapat",
        "Kolom khusus untuk Keputusan Rapat",
        "Fitur unggah dokumen lampiran"
      ]
    }
  },
  
  // ... Tambahkan 12 buku lainnya di sini
  // Cukup salin-tempel salah satu objek di atas dan ganti isinya.
};

// Fungsi untuk mengambil data.
export function getBukuData(slug: string): BukuFitur | undefined {
  return BUKU_DATA[slug];
}