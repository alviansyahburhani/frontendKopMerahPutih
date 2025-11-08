// frontend/types/api.types.ts
import { Gender, Role } from './enums';

// Tipe error standar dari NestJS
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface TenantRegistration {
  id: string;
  cooperativeName: string;
  skAhuKoperasi: string | null;
  province: string;
  city: string;
  district: string;
  village: string;
  alamatLengkap: string;
  petaLokasi: string | null;
  picFullName: string;
  picNik: string;
  picGender: 'MALE' | 'FEMALE';
  picPlaceOfBirth: string;
  picDateOfBirth: string; // Tipe string karena JSON
  picOccupation: string;
  picAddress: string;
  picPhoneNumber: string;
  email: string; // Email PIC (untuk login)
  // hashedPpassword tidak akan dikirim ke frontend
  dokPengesahanPendirian: string | null;
  dokDaftarUmum: string | null;
  dokAkteNotaris: string | null;
  dokNpwpKoperasi: string | null;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  schemaName: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string; // Tipe string karena JSON
  updatedAt: string; // Tipe string karena JSON
  
  registration?: TenantRegistration | null; 
}

// === Auth ===
export interface SuperAdminUser {
  userId: string;
  email: string;
  role: 'SuperAdmin'; // Role-nya spesifik 'SuperAdmin'
  fullName: string;
}
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role; // <- Ini sekarang akan menggunakan enum Role (Pengurus, Anggota, Pengawas)
  fullName?: string;
  tenantId?: string;
}

// Tipe data lengkap untuk profil anggota yang login
export interface MemberProfile {
  id: string;
  nik: string;
  fullName: string;
  gender: Gender;
  placeOfBirth: string;
  dateOfBirth: string; 
  occupation: string;
  address: string;
  phoneNumber: string;
  memberNumber: string; 
  joinDate: string; 
  status: 'ACTIVE' | 'INACTIVE'; 
  email: string;

  signatureUrl: string | null; // Ini kolom URL (yang saat ini null)
  signatureData: string | null; // [TAMBAHKAN INI] Ini kolom Base64 (yang terisi)
  
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// [BARU] DTO untuk MENGIRIM update profil (PATCH /profile/me)
// Sesuai dengan file update-my-profile.dto.ts Anda
export interface UpdateMyProfileDto {
  fullName?: string;
  occupation?: string;
  address?: string;
  phoneNumber?: string;
  signatureData?: string | null; // <-- Ini yang kita kirim (PATCH)
}

// === Simpanan ===
// Sesuai dengan respons dari /simpanan/saldo
export interface SimpananSaldo {
  id: string;
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
  memberId: string;
  lastUpdatedAt: string; // ISO Date string
}

// === Pinjaman ===
// Sesuai dengan respons dari /loans/my-loans
export interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  loanAmount: number;
  interestRate: number;
  loanDate: string; // ISO Date string
  termMonths: number;
  dueDate: string; // ISO Date string
  purpose?: string;
  status: string; // 'ACTIVE', 'PAID_OFF', 'OVERDUE'
  paidOffDate?: string; // ISO Date string
  // Jika backend menyertakan angsuran, tambahkan juga di sini
  // installments: LoanInstallment[];
}

// === Public (Tenant Registration) ===
/**
 * Disesuaikan 100% dengan backend/src/public/dto/register-tenant.dto.ts
 */
export interface RegisterTenantDto {
  cooperativeName: string;
  subdomain: string;
  skAhuKoperasi?: string; // <-- PERBAIKAN: Ini opsional di DTO
  province: string;
  city: string;
  district: string;
  village: string;
  alamatLengkap: string;
  petaLokasi?: string; // <-- Opsional
  
  picFullName: string;
  picNik: string;
  picGender: Gender; // MALE | FEMALE
  picPlaceOfBirth: string;
  picDateOfBirth: string; // YYYY-MM-DD
  picOccupation: string;
  picAddress: string;
  picPhoneNumber: string;
  
  email: string;
  password: string;
  
  // PERBAIKAN: Semua dokumen opsional di backend DTO
  dokPengesahanPendirianUrl?: string; 
  dokDaftarUmumUrl?: string;
  dokAkteNotarisUrl?: string;
  dokNpwpKoperasiUrl?: string;
}

export interface RegisterTenantResponse {
  message: string;
  tenantId: string;
}

// === Member Registration ===
/**
 * Tipe ini sudah 100% sesuai dengan
 * backend/src/member-registrations/dto/create-member-registration.dto.ts
 */
export interface CreateMemberRegistrationDto {
  email: string;
  password: string;
  nik: string;
  fullName: string;
  gender: Gender; // MALE | FEMALE
  placeOfBirth: string;
  dateOfBirth: string; // YYYY-MM-DD
  occupation: string;
  address: string;
  phoneNumber: string;
  targetSubdomain?: string;
  signatureData: string;
}

export interface MemberRegistrationResponse {
  message: string;
  registrationId: string;
}

export interface MemberRegistration {
  id: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  nik: string;
  fullName: string;
  gender: Gender;
  email: string;
  phoneNumber: string;
  placeOfBirth: string;
  dateOfBirth: string; // ISO Date string
  occupation: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processedById?: string | null;
  processedAt?: string | null; // ISO Date string
  rejectionReason?: string | null;
  // hashedPassword tidak disertakan
}

// === Uploads ===
export interface UploadResponse {
  url: string;
}

export interface CreateGuestBookDto {
  guestName: string;
  origin: string;
  meetWith?: string;
  purpose?: string;
  signatureUrl?: string;
}

// DTO untuk Edit (PATCH /guest-book/:id)
export interface UpdateGuestBookDto {
  guestName?: string;
  origin?: string;
  meetWith?: string;
  purpose?: string;
  signatureUrl?: string;
}

// Tipe Data untuk Baca (GET /guest-book)
export interface GuestBookEntry {
  id: string;
  entryNumber: number; // Nomor Urut
  date: string; // ISO string
  guestName: string;
  origin: string;
  meetWith?: string | null;
  purpose: string;
  signatureUrl?: string | null;
}

/**
 * DTO (Payload) untuk MEMBUAT notulen rapat pengurus.
 * Sesuai dengan CreateBoardMeetingNoteDto di backend.
 * Endpoint: POST /board-meeting-notes
 */
export interface CreateBoardMeetingNoteDto {
  date: string; // Sebaiknya dalam format YYYY-MM-DD atau ISO string
  location: string;
  leader: string;
  totalAttendees: number;
  agenda: string; // Teks biasa, bukan array
  decisions: string; // Teks biasa, bukan array
  notulenSignatureUrl?: string; // Opsional
}

/**
 * DTO (Payload) untuk MENGUPDATE notulen rapat pengurus.
 * Sesuai dengan UpdateBoardMeetingNoteDto di backend.
 * Endpoint: PATCH /board-meeting-notes/:id
 */
export type UpdateBoardMeetingNoteDto = Partial<CreateBoardMeetingNoteDto>;

/**
 * Tipe data respons penuh untuk Notulen Rapat Pengurus.
 * Ini yang diterima dari backend saat GET.
 * Endpoint: GET /board-meeting-notes
 */
export interface BoardMeetingNoteResponse {
  id: string;
  date: string;
  location: string;
  leader: string;
  totalAttendees: number;
  agenda: string;
  decisions: string;
  notulenSignatureUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relasi: Pengurus yang mencatat notulen
  // Sesuai analisis backend, 'notulenBy' akan disertakan
  notulenBy: {
    id: string;
    fullName: string;
  };
}

// Tipe Data untuk Baca (GET /agenda-expedition)
export interface AgendaExpedition {
  id: string;
  mailSequenceNumber: number;
  letterDate: string;
  letterNumber: string;
  addressedTo: string;
  subject: string;
  notes?: string | null; // <-- Biarkan di sini, tidak masalah saat membaca
  type: 'LETTER_IN' | 'LETTER_OUT';
}

// DTO untuk Tulis (POST /agenda-expedition)
export interface CreateAgendaExpeditionDto {
  letterDate: string;
  letterNumber: string;
  addressedTo: string;
  subject: string;
  type: 'LETTER_IN' | 'LETTER_OUT';
  // notes?: string; // <-- HAPUS BARIS INI
}

// DTO untuk Edit (PATCH /agenda-expedition/:id)
export interface UpdateAgendaExpeditionDto {
  letterDate?: string;
  letterNumber?: string;
  addressedTo?: string;
  subject?: string;
  // notes?: string; // <-- HAPUS BARIS INI
}


/**
 * Tipe data lengkap Artikel/Berita yang dikembalikan oleh backend
 * (Sesuai model Prisma `Article` & DTO backend)
 */
export interface News {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  imageUrl: string | null;
  sourceLink: string | null;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  publishedAt: string | null; // ISO Date string
  createdAt: string;
  updatedAt: string;
  excerpt: string | null;

  // Relasi (dari 'include' di backend)
  author?: {
    fullName: string;
  };
}
/**
 * Tipe data untuk satu item di Galeri (SESUAI BACKEND)
 */
export interface GalleryItem {
  id: string;
  imageUrl: string;
  description: string | null; // <-- Diperbaiki (sebelumnya caption)
  order: number | null;       // <-- Ditambahkan
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO untuk mengupdate deskripsi/urutan gambar (SESUAI BACKEND)
 */
export interface UpdateGalleryItemDto {
  description?: string;
  order?: number;
}

// (Tipe Paginasi yang sudah kita tambahkan sebelumnya, ini sudah benar)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}