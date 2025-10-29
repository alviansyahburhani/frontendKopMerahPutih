// frontend/services/admin.service.ts
import { api, parseApiError } from '@/lib/api';
import { MemberRegistration } from '@/types/api.types'; // Asumsi Anda punya tipe ini
import { Gender } from '@/types/enums';

export interface TenantInfo {
  cooperativeName: string;
  city: string;
  legalNumber: string; // Sesuaikan nama field jika berbeda di backend
  // Tambahkan field lain jika perlu
}

export interface Member {
  id: string; // ID unik dari database
  memberNumber?: string; // Nomor keanggotaan (jika ada)
  fullName: string;
  nik: string;
  gender: Gender;
  placeOfBirth: string;
  dateOfBirth: string; // ISO String atau YYYY-MM-DD
  occupation: string;
  address: string;
  phoneNumber: string;
  email: string; // Email untuk login (jika ada)
  joinDate: string; // Tanggal masuk (ISO String atau YYYY-MM-DD)
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'; // Sesuaikan statusnya
  exitDate?: string | null; // Tanggal berhenti
  exitReason?: string | null; // Alasan berhenti
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string; // ID dari tabel board_positions
  jabatan: 'Ketua' | 'Sekretaris' | 'Bendahara'; // Sesuai enum JabatanPengurus
  tanggalDiangkat: string; // ISO Date string
  tanggalBerhenti?: string | null; // ISO Date string or null
  alasanBerhenti?: string | null;
  memberId: string; // ID Anggota
  // Data dari relasi 'member'
  member: {
    id: string;
    memberNumber?: string;
    fullName: string;
    occupation?: string;
    address?: string;
    gender?: Gender;
    placeOfBirth?: string;
    dateOfBirth?: string; // ISO Date string
  };
  // fingerprintUrl?: string; // Opsional
  // signatureUrl?: string; // Opsional
  createdAt: string;
  updatedAt: string;
}

// DTO untuk membuat anggota (sesuaikan dengan backend)
export interface CreateMemberDto {
  fullName: string;
  nik: string;
  gender: Gender;
  placeOfBirth: string;
  dateOfBirth: string; // YYYY-MM-DD
  occupation: string;
  address: string;
  phoneNumber: string;
  email?: string; // Opsional jika tidak semua anggota punya akun
  password?: string; // Opsional
  joinDate?: string; // YYYY-MM-DD, bisa di-default backend
  status?: 'ACTIVE' | 'PENDING'; // Biasanya default ACTIVE
}

// --- Interface untuk Data Karyawan (Employee) dari Backend ---
// Sesuaikan dengan data yang dikembalikan GET /employees (termasuk member)
export interface Employee {
  id: string; // ID dari tabel employees
  jabatan: string; // Posisi/Jabatan Karyawan
  tanggalDiangkat: string; // ISO Date string
  tanggalBerhenti?: string | null; // ISO Date string or null
  alasanBerhenti?: string | null;
  memberId: string; // ID Anggota (jika karyawan juga anggota) atau ID User? Perlu konfirmasi skema
  // Data dari relasi 'member' (jika karyawan PASTI anggota)
  // ATAU data dari relasi 'user' jika karyawan tidak harus anggota
  // Asumsi karyawan adalah member:
  member: {
    id: string;
    memberNumber?: string;
    fullName: string;
    nik?: string; // Pastikan NIK ada di Member jika perlu ditampilkan
    occupation?: string; // Mungkin tidak relevan di sini
    address?: string;
    gender?: Gender;
    placeOfBirth?: string;
    dateOfBirth?: string; // ISO Date string
    phoneNumber?: string; // Tambahkan jika perlu
  };
  createdAt: string;
  updatedAt: string;
}

export interface MemberWithRole extends Member {
  role?: string; // Dari relasi user -> role -> name
  jabatan?: string | null; // Dari relasi boardPositions (jabatan aktif)
  // Tambahkan relasi asli jika backend mengirimnya:
  user?: { role?: { name?: string } } | null;
  boardPositions?: { jabatan?: string }[];
}

// --- DTO untuk Membuat Karyawan Baru ---
// Sesuai dengan backend CreateEmployeeDto
export interface CreateEmployeeDto {
  jabatan: string;
  tanggalDiangkat: string; // YYYY-MM-DD
  memberId: string; // Asumsi karyawan harus punya relasi ke Member
  // Tambahkan field lain jika ada (misal: salary, department)
}

// --- DTO untuk Update Karyawan ---
// Sesuai dengan backend UpdateEmployeeDto
export interface UpdateEmployeeDto extends Partial<Omit<CreateEmployeeDto, 'memberId'>> {
  tanggalBerhenti?: string | null; // YYYY-MM-DD or null
  alasanBerhenti?: string | null;
  // Tambahkan field lain jika bisa diupdate
}


// Wrapper (bisa copy dari auth.service.ts)
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// DTO untuk update anggota (sesuaikan dengan backend)
export interface UpdateMemberDto extends Partial<Omit<CreateMemberDto, 'password' | 'email' | 'status'>> {
  // Definisikan status secara eksplisit di sini dengan semua kemungkinan nilai
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'; // Izinkan semua status yang relevan saat update
  exitDate?: string | null;
  exitReason?: string | null;
}


// --- DTO untuk Membuat Pengurus Baru ---
// Sesuai dengan backend CreateBoardPositionDto
export interface CreateBoardMemberDto {
  jabatan: 'Ketua' | 'Sekretaris' | 'Bendahara';
  tanggalDiangkat: string; // YYYY-MM-DD
  memberId: string;
  // fingerprintUrl?: string;
  // signatureUrl?: string;
}

// --- DTO untuk Update Pengurus (termasuk pemberhentian) ---
// Sesuai dengan backend UpdateBoardPositionDto
export interface UpdateBoardMemberDto extends Partial<Omit<CreateBoardMemberDto, 'memberId'>> {
  tanggalBerhenti?: string | null; // YYYY-MM-DD or null
  alasanBerhenti?: string | null;
}

export interface MemberSearchResult {
  id: string;
  fullName: string;
  nik: string;
  // Tambahkan field lain jika perlu ditampilkan di hasil search
}

// --- Interface TenantSummary (sesuai GET /tenants) ---
export interface TenantSummary {
  id: string;
  name: string; // Nama Koperasi
  subdomain: string;
  schemaName: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  // Tambahkan city dan legalNumber jika backend mengembalikannya
  city?: string;
  legalNumber?: string;
}

export type PendingRegistration = Omit<MemberRegistration, 'hashedPassword'>;

export const adminService = {


  /**
   * Mengambil daftar semua tenant.
   * Endpoint: GET /tenants (Sesuai Swagger)
   */
  getAllTenants: (): Promise<TenantSummary[]> => {
    return handleRequest(api.get<TenantSummary[]>('/tenants'));
  },

  /**
   * Mengambil semua data karyawan.
   * Endpoint: GET /employees
   */
  getAllEmployees: (): Promise<Employee[]> => {
    return handleRequest(api.get<Employee[]>('/employees'));
  },

  /**
   * Menambah karyawan baru.
   * Endpoint: POST /employees
   */
  createEmployee: (dto: CreateEmployeeDto): Promise<Employee> => {
    return handleRequest(api.post<Employee>('/employees', dto));
  },

  /**
   * Mengupdate data karyawan.
   * Endpoint: PATCH /employees/:id
   */
  updateEmployee: (id: string, dto: UpdateEmployeeDto): Promise<Employee> => {
    return handleRequest(api.patch<Employee>(`/employees/${id}`, dto));
  },

  /**
   * Memberhentikan karyawan (soft delete).
   * Endpoint: DELETE /employees/:id
   * Backend akan mengisi tanggalBerhenti & alasanBerhenti.
   */
  removeEmployee: (id: string, reason: string): Promise<{ message: string }> => {
    // Backend DELETE controller memanggil service 'remove' yang butuh alasan
    // Kita kirim alasan via body (sesuaikan jika backend mengharapkan cara lain)
    return handleRequest(api.delete<{ message: string }>(`/employees/${id}`, { data: { alasanBerhenti: reason } }));
  },


  /**
   * Mengambil semua data pengurus (board members).
   * Endpoint: GET /board-positions
   */
  getAllBoardMembers: (): Promise<BoardMember[]> => {
    // Pastikan endpoint '/board-positions' ini BENAR
    return handleRequest(api.get<BoardMember[]>('/board-positions'));
  },

  /**
   * Mengambil jabatan pengurus aktif milik pengguna yang sedang login.
   * Endpoint: GET /board-positions/me
   */
  getMyActiveBoardPositions: (): Promise<BoardMember[]> => {
    return handleRequest(api.get<BoardMember[]>('/board-positions/me'));
  },

  /**
   * Menambah pengurus baru.
   * Endpoint: POST /board-positions
   */
  createBoardMember: (dto: CreateBoardMemberDto): Promise<BoardMember> => {
    // Pastikan endpoint '/board-positions' ini BENAR
    return handleRequest(api.post<BoardMember>('/board-positions', dto));
  },

  /**
   * Mengupdate data pengurus (termasuk pemberhentian).
   * Endpoint: PATCH /board-positions/:id
   */
  updateBoardMember: (id: string, dto: UpdateBoardMemberDto): Promise<BoardMember> => {
    // Pastikan endpoint '/board-positions/:id' dan method PATCH BENAR
    return handleRequest(api.patch<BoardMember>(`/board-positions/${id}`, dto));
  },

  /**
   * Memberhentikan pengurus (soft delete via service backend).
   * Endpoint: DELETE /board-positions/:id
   * Backend service akan update tanggalBerhenti & alasan.
   */
   removeBoardMember: (id: string): Promise<{ message: string }> => { // Sesuaikan response jika backend beda
    // Pastikan endpoint '/board-positions/:id' dan method DELETE BENAR
    return handleRequest(api.delete<{ message: string }>(`/board-positions/${id}`));
  },


  /**
   * BARU: Mengambil informasi detail tenant/koperasi saat ini.
   * Endpoint: GET /admin/tenant-info (Contoh)
   * Backend akan mengambil tenantId dari token JWT admin.
   */
  // getTenantInfo: (): Promise<TenantInfo> => {
  //   // Sesuaikan endpoint jika berbeda
  //   return handleRequest(api.get<TenantInfo>('/admin/tenant-info'));
  // },


  /**
   * Mengambil semua data anggota.
   * Endpoint: GET /admin/members (Contoh)
   */
    getAllMembers: (): Promise<MemberWithRole[]> => {
        return handleRequest(api.get<MemberWithRole[]>('/members'));
    },

  searchMembers: (searchTerm: string): Promise<MemberSearchResult[]> => {
    // Pastikan endpoint '/members' dan query param 'search' benar
    return handleRequest(api.get<MemberSearchResult[]>('/members', {
      params: { search: searchTerm }
    }));
  },

  /**
   * Menambah anggota baru.
   * Endpoint: POST /admin/members (Contoh)
   */
  createMember: (dto: CreateMemberDto): Promise<Member> => {
    // Sesuaikan endpoint jika berbeda
    return handleRequest(api.post<Member>('/members', dto));
  },

  /**
   * Mengupdate data anggota.
   * Endpoint: PUT /admin/members/:id (Contoh)
   */
  updateMember: (id: string, dto: UpdateMemberDto): Promise<Member> => {
    // Sesuaikan endpoint jika berbeda
    return handleRequest(api.put<Member>(`/members/${id}`, dto));
  },

  /**
   * Menghapus data anggota.
   * Endpoint: DELETE /admin/members/:id (Contoh)
   * Backend mungkin tidak benar-benar menghapus, tapi menandai sebagai INACTIVE
   */
  deleteMember: (id: string): Promise<{ message: string }> => {
    // Sesuaikan endpoint jika berbeda
    return handleRequest(api.delete<{ message: string }>(`/members/${id}`));
  },

  /**
   * Mengambil daftar pendaftaran anggota yang pending
   * Endpoint: GET /member-registrations/pending
   */
  getPendingRegistrations: (): Promise<PendingRegistration[]> => {
    return handleRequest(api.get<PendingRegistration[]>('/member-registrations/pending'));
  },

  /**
   * Menyetujui pendaftaran anggota
   * Endpoint: POST /member-registrations/:id/approve
   */
  approveRegistration: (registrationId: string): Promise<{ message: string }> => {
    return handleRequest(
      api.post(`/member-registrations/${registrationId}/approve`),
    );
  },

  /**
   * Menolak pendaftaran anggota
   * Endpoint: POST /member-registrations/:id/reject
   */
  rejectRegistration: (
    registrationId: string,
    reason: string,
  ): Promise<{ message: string }> => {
    // Kirim alasan penolakan sebagai query parameter
    return handleRequest(
      api.post(`/member-registrations/${registrationId}/reject`, null, {
        params: { reason },
      }),
    );
  },
};
