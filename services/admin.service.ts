// frontend/services/admin.service.ts
import { api, parseApiError } from '@/lib/api';
import { MemberRegistration } from '@/types/api.types'; // Asumsi Anda punya tipe ini
import { Gender } from '@/types/enums';
import {
  GuestBookEntry,
  UpdateGuestBookDto,
} from '@/types/api.types';

export interface TenantInfo {
  cooperativeName: string;
  city: string;
  legalNumber: string; // Sesuaikan nama field jika berbeda di backend
  // Tambahkan field lain jika perlu
}

//BUKU TAMU
export interface GuestBookMessage {
  id: string;
  tanggal: string; // atau createdAt (pastikan disesuaikan)
  nama: string; // atau guestName
  asal: 'Anggota' | 'Tamu Publik'; // atau origin
  pesan: string; // atau purpose
  status: 'Baru' | 'Sudah Ditanggapi';
  // tambahkan field lain jika ada (meetWith, signatureUrl, dll)
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

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  roleName: string; // misal: 'Anggota'
  memberId: string; // ID dari Member yang baru dibuat
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

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  memberId: string | null;
  createdAt: string;
  updatedAt: string;
  // Tambahkan relasi jika perlu
  role?: { name: string };
  member?: { fullName: string };
}

export interface SupervisoryPosition {
    id: string; // ID dari tabel supervisory_positions
    jabatan: string; // 'Ketua Pengawas', 'Anggota Pengawas', dll.
    tanggalDiangkat: string; // ISO Date string
    tanggalBerhenti?: string | null; // ISO Date string or null
    alasanBerhenti?: string | null;
    memberId: string; // ID Anggota
    // Data dari relasi 'member' (bisa jadi tidak di-include di semua call)
    member?: {
      id: string;
      memberNumber?: string;
      fullName: string;
      occupation?: string;
      address?: string;
      gender?: Gender;
      placeOfBirth?: string;
      dateOfBirth?: string; // ISO Date string
    };
    createdAt: string;
    updatedAt: string;
  }
  
  // [TAMBAHKAN] DTO untuk membuat Pengawas baru
  export interface CreateSupervisoryPositionDto {
    memberId: string;
    jabatan: string;
    tanggalDiangkat: string; // Format YYYY-MM-DD
  }
  
  // [TAMBAHKAN] DTO untuk update Pengawas
  export interface UpdateSupervisoryPositionDto {
    jabatan?: string;
    tanggalDiangkat?: string; // YYYY-MM-DD
    tanggalBerhenti?: string | null; // YYYY-MM-DD atau null
    alasanBerhenti?: string | null;
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
   * BARU: Membuat entitas User (akun login) untuk Anggota.
   * Endpoint: POST /users
   */
  createUser: (dto: CreateUserDto): Promise<User> => {
    // Pastikan endpoint '/users' ini BENAR
    return handleRequest(api.post<User>('/users', dto));
  },

  


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
   * [SUDAH ADA] Mengambil semua data pengawas (supervisory positions).
   * Endpoint: GET /supervisory-positions
   */
getAllSupervisoryPositions: (): Promise<SupervisoryPosition[]> => {
  return handleRequest(api.get<SupervisoryPosition[]>('/supervisory-positions'));
},

/**
 * [TAMBAHKAN] Menambah pengawas baru.
 * Endpoint: POST /supervisory-positions
 */
createSupervisoryPosition: (dto: CreateSupervisoryPositionDto): Promise<SupervisoryPosition> => {
  return handleRequest(api.post<SupervisoryPosition>('/supervisory-positions', dto));
},

/**
 * [TAMBAHKAN] Mengupdate data pengawas (termasuk pemberhentian).
 * Endpoint: PATCH /supervisory-positions/:id
 */
updateSupervisoryPosition: (id: string, dto: UpdateSupervisoryPositionDto): Promise<SupervisoryPosition> => {
  return handleRequest(api.patch<SupervisoryPosition>(`/supervisory-positions/${id}`, dto));
},

/**
 * [TAMBAHKAN] Memberhentikan pengawas (soft delete via service).
 * Endpoint: DELETE /supervisory-positions/:id
 * (Asumsi backend menangani logika soft delete saat di-DELETE)
 */
terminateSupervisoryPosition: (id: string): Promise<{ message: string }> => {
  return handleRequest(api.delete<{ message: string }>(`/supervisory-positions/${id}`));
},




    /**
     * Mengambil semua data anggota.
     * Endpoint: GET /members
     */
    getAllMembers: (): Promise<MemberWithRole[]> => { // <-- PASTIKAN TIPE INI BENAR
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
      return handleRequest(api.put<Member>(`/members/${id}`, dto)); // <-- PROBLEM HERE
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
   * DELETE /members/:id
   * swagger: “Menonaktifkan keanggotaan (soft delete)”
   */
  deactivateMember: (id: string, exitReason: string): Promise<{ message: string }> => {
    // kalau backend kamu nggak butuh body → hapus { data: ... } nya
    return handleRequest(
      api.delete<{ message: string }>(`/members/${id}`, {
        data: { exitReason },
      }),
    );
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
/**
   * Mengambil daftar buku tamu (Perlu login Admin)
   * Endpoint: GET /guest-book
   */
  getGuestBookEntries: (): Promise<GuestBookEntry[]> => {
    return handleRequest(api.get<GuestBookEntry[]>('/guest-book'));
  },

  /**
   * Mengupdate entri buku tamu (Admin)
   * Endpoint: PATCH /guest-book/:id
   */
  updateGuestBookEntry: (
    id: string,
    dto: UpdateGuestBookDto
  ): Promise<GuestBookEntry> => {
    // Backend Anda tidak memiliki 'status', jadi kita kirim DTO update standar
    return handleRequest(api.patch<GuestBookEntry>(`/guest-book/${id}`, dto));
  },

  /**
   * Menghapus entri buku tamu (Admin)
   * Endpoint: DELETE /guest-book/:id
   */
  deleteGuestBookEntry: (id: string): Promise<void> => {
    return handleRequest(api.delete<void>(`/guest-book/${id}`));
  },


};