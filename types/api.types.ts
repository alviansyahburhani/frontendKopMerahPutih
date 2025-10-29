// frontend/types/api.types.ts
import { Gender, Role } from './enums'; // Impor dari file enums.ts yang sudah benar

// Tipe error standar dari NestJS
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

// === Auth ===
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
