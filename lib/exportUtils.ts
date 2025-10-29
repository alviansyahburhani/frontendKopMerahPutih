

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// --- Fungsi Helper ---
function getFormattedDate() {
    return new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

// ===================================================================
// Tipe Data & Fungsi untuk Laporan Simpanan Anggota
// ===================================================================
type SimpananTransaksi = {
    id: string;
    tanggal: string;
    anggota: {
        id: string;
        nama: string;
    };
    jenis: 'Pokok' | 'Wajib' | 'Sukarela';
    keterangan: string;
    tipe: 'Setoran' | 'Penarikan';
    jumlah: number;
};

/**
 * Membuat dan mengunduh laporan transaksi simpanan dalam format PDF.
 */
export function generateSimpananPdf(transaksiData: SimpananTransaksi[]) {
    const doc = new jsPDF();
    const tableHeaders = ["Tanggal", "Anggota", "Jenis Simpanan", "Keterangan", "Tipe", "Jumlah (Rp)"];
    const tableData = transaksiData.map(trx => [
        new Date(trx.tanggal).toLocaleDateString('id-ID'),
        trx.anggota.nama,
        trx.jenis,
        trx.keterangan,
        trx.tipe,
        `${trx.tipe === 'Penarikan' ? '-' : ''}${trx.jumlah.toLocaleString('id-ID')}`
    ]);
    
    doc.text("Laporan Transaksi Simpanan Anggota", 14, 15);
    autoTable(doc, { // <-- Ganti menjadi metode baru seperti ini
        head: [tableHeaders],
        body: tableData,
        startY: 20,
    });
    doc.save(`Laporan_Simpanan_${getFormattedDate()}.pdf`);
}

/**
 * Membuat dan mengunduh laporan transaksi simpanan dalam format Excel.
 */
export function generateSimpananExcel(transaksiData: SimpananTransaksi[]) {
    const worksheet = XLSX.utils.json_to_sheet(
        transaksiData.map(trx => ({
            "Tanggal": new Date(trx.tanggal).toLocaleDateString('id-ID'),
            "Anggota": trx.anggota.nama,
            "Jenis Simpanan": trx.jenis,
            "Keterangan": trx.keterangan,
            "Tipe": trx.tipe,
            "Jumlah (Rp)": trx.tipe === 'Penarikan' ? -trx.jumlah : trx.jumlah,
        }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi Simpanan");
    XLSX.writeFile(workbook, `Laporan_Simpanan_${getFormattedDate()}.xlsx`);
}

// ===================================================================
// Tipe Data & Fungsi untuk Laporan Daftar Inventaris
// ===================================================================
type Inventaris = {
    id: string;
    kodeBarang: string;
    namaBarang: string;
    jenis: 'Elektronik' | 'Perabotan' | 'ATK' | 'Kendaraan' | 'Lainnya';
    tanggalPerolehan: string;
    jumlah: number;
    satuan: string;
    nilaiPerolehan: number;
    kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
    lokasi: string;
};

export function generateInventarisPdf(data: Inventaris[], title: string) {
    const doc = new jsPDF();
    const tableHeaders = ["Kode", "Nama Barang", "Jenis", "Jumlah", "Nilai (Rp)", "Kondisi", "Lokasi"];
    const tableData = data.map(item => [
        item.kodeBarang,
        item.namaBarang,
        item.jenis,
        `${item.jumlah} ${item.satuan}`,
        item.nilaiPerolehan.toLocaleString('id-ID'),
        item.kondisi,
        item.lokasi,
    ]);
    
    doc.text(title, 14, 15);
    autoTable(doc, { head: [tableHeaders], body: tableData, startY: 20 });
    doc.save(`Laporan_Inventaris_${getFormattedDate()}.pdf`);
}

export function generateInventarisExcel(data: Inventaris[], title: string) {
    const worksheet = XLSX.utils.json_to_sheet(
        data.map(item => ({
            "Kode Barang": item.kodeBarang,
            "Nama Barang": item.namaBarang,
            "Jenis": item.jenis,
            "Tanggal Perolehan": new Date(item.tanggalPerolehan).toLocaleDateString('id-ID'),
            "Jumlah": item.jumlah,
            "Satuan": item.satuan,
            "Nilai Perolehan (Rp)": item.nilaiPerolehan,
            "Kondisi": item.kondisi,
            "Lokasi": item.lokasi,
        }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Inventaris");
    XLSX.writeFile(workbook, `Laporan_Inventaris_${getFormattedDate()}.xlsx`);
}