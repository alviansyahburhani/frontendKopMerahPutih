// frontend/services/admin.service.ts
import { api, parseApiError } from '@/lib/api';
import { MemberRegistration } from '@/types/api.types'; // Asumsi Anda punya tipe ini
import { Gender } from '@/types/enums';
import {
  GuestBookEntry,
  UpdateGuestBookDto,
} from '@/types/api.types';
import { 
  AgendaExpedition,
  CreateAgendaExpeditionDto,
  UpdateAgendaExpeditionDto,
} from '@/types/api.types';

export interface TenantInfo {
  cooperativeName: string;
  city: string;
  legalNumber: string; // Sesuaikan nama field jika berbeda di backend
  // Tambahkan field lain jika perlu
}

//SARAN ANGGOTA
// Tipe untuk DTO saat admin menanggapi
export interface RespondSuggestionDto {
  response: string;
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



// Tipe data lengkap untuk Saran Anggota (sesuai backend)
export interface MemberSuggestionResponse {
  id: string;
  suggestion: string;
  response: string | null; // Tanggapan dari admin
  createdAt: string; // Tanggal saran dibuat
  updatedAt: string;
  member: {
    // Data pengirim (Anggota)
    id: string;
    fullName: string;
    address: string;
  };
  responseByUser: {
    // Data penanggap (Admin)
    id: string;
    fullName: string;
  } | null;
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

/**
 * Tipe data lengkap dari backend (Prisma Model)
 * Sesuai dengan GET /official-recommendation
 */
export interface OfficialRecommendation {
  id: string;
  entryNumber: number; // No Urut
  date: string; // Tanggal Catat (Kolom 2) - INI AKAN MENJADI ISO STRING
  
  officialName: string; // Nama Pejabat (Kolom 3)
  officialPositionAndAddress: string; // Jabatan & Alamat (Kolom 4 & 5)
  recommendation: string; // Isi Anjuran (Kolom 5)
  documentUrl: string | null; // Tanda Tangan/Dokumen Pejabat (Kolom 6)

  response: string | null; // Tanggapan Pengurus (Kolom 7)
  responseAt: string | null; // Tanggal Tanggapan
  
  // Tanda Tangan Pengurus (Kolom 8) - Diwakili oleh relasi
  responseByUserId: string | null;
  responseByUser: {
    id: string;
    fullName: string;
  } | null;
  
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO untuk MENCATAT anjuran baru
 * Sesuai dengan POST /official-recommendation
 */
export interface CreateOfficialRecommendationDto {
  date: string; // HARUS ISO STRING (cth: 2025-11-02T00:00:00.000Z)
  officialName: string;
  officialPositionAndAddress: string;
  recommendation: string;
}

/**
 * DTO untuk MEMBERI TANGGAPAN
 * Sesuai dengan POST /:id/respond
 */
export interface RespondOfficialRecommendationDto {
  response: string;
}



export type PendingRegistration = Omit<MemberRegistration, 'hashedPassword'>;

export const adminService = {


  /**
   * (BUKU 14) Mengambil semua Anjuran Pejabat.
   * Endpoint: GET /official-recommendation
   */
  getAllOfficialRecommendations: (): Promise<OfficialRecommendation[]> => {
    return handleRequest(api.get<OfficialRecommendation[]>('/official-recommendation'));
  },

  /**
   * (BUKU 14) Mencatat Anjuran Pejabat baru.
   * Endpoint: POST /official-recommendation
   */
  createOfficialRecommendation: (dto: CreateOfficialRecommendationDto): Promise<OfficialRecommendation> => {
    return handleRequest(api.post<OfficialRecommendation>('/official-recommendation', dto));
  },

  /**
   * (BUKU 14) Memberi tanggapan pada Anjuran Pejabat.
   * Endpoint: POST /official-recommendation/:id/respond
   */
  respondToRecommendation: (id: string, dto: RespondOfficialRecommendationDto): Promise<OfficialRecommendation> => {
    return handleRequest(api.post<OfficialRecommendation>(`/official-recommendation/${id}/respond`, dto));
  },

  /**
   * (BUKU 14) Mengunggah dokumen/scan anjuran (Kolom 6).
   * Endpoint: POST /official-recommendation/:id/document
   */
  uploadAnjuranDocument: (id: string, file: File): Promise<OfficialRecommendation> => {
    const formData = new FormData();
    formData.append('file', file);
    // 'api.post' sudah di-setup di 'lib/api.ts' untuk handle FormData (menghapus Content-Type)
    return handleRequest(api.post<OfficialRecommendation>(`/official-recommendation/${id}/document`, formData));
  },

  /**
   * (BUKU 14) Menghapus Anjuran Pejabat.
   * Endpoint: DELETE /official-recommendation/:id
   */
  deleteOfficialRecommendation: (id: string): Promise<{ message: string }> => {
    return handleRequest(api.delete<{ message: string }>(`/official-recommendation/${id}`));
  },


  /**
   * Mengambil semua entri agenda & ekspedisi (Admin)
   * Endpoint: GET /agenda-expedition
   */
  getAgendaExpeditions: (): Promise<AgendaExpedition[]> => {
    return handleRequest(api.get<AgendaExpedition[]>('/agenda-expedition'));
  },

  /**
   * Membuat entri agenda/ekspedisi baru (Admin)
   * Endpoint: POST /agenda-expedition
   */
  createAgendaExpedition: (
    dto: CreateAgendaExpeditionDto
  ): Promise<AgendaExpedition> => {
    return handleRequest(api.post<AgendaExpedition>('/agenda-expedition', dto));
  },

  /**
   * Mengupdate entri agenda/ekspedisi (Admin)
   * Endpoint: PATCH /agenda-expedition/:id
   */
  updateAgendaExpedition: (
    id: string,
    dto: UpdateAgendaExpeditionDto
  ): Promise<AgendaExpedition> => {
    return handleRequest(api.patch<AgendaExpedition>(`/agenda-expedition/${id}`, dto));
  },

  /**
   * Menghapus entri agenda/ekspedisi (Admin)
   * Endpoint: DELETE /agenda-expedition/:id
   */
  deleteAgendaExpedition: (id: string): Promise<void> => {
    return handleRequest(api.delete<void>(`/agenda-expedition/${id}`));
  },
  

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
   * Mengambil semua notulen rapat pengurus
   * Endpoint: GET /board-meeting-notes
   */
  getBoardMeetingNotes: (): Promise<BoardMeetingNoteResponse[]> => {
    return handleRequest(api.get<BoardMeetingNoteResponse[]>('/board-meeting-notes'));
  },

  /**
   * Membuat notulen rapat pengurus baru
   * Endpoint: POST /board-meeting-notes
   */
  createBoardMeetingNote: (dto: CreateBoardMeetingNoteDto): Promise<BoardMeetingNoteResponse> => {
    return handleRequest(api.post<BoardMeetingNoteResponse>('/board-meeting-notes', dto));
  },

  /**
   * Mengupdate notulen rapat pengurus
   * Endpoint: PATCH /board-meeting-notes/:id
   */
  updateBoardMeetingNote: (id: string, dto: UpdateBoardMeetingNoteDto): Promise<BoardMeetingNoteResponse> => {
    return handleRequest(api.patch<BoardMeetingNoteResponse>(`/board-meeting-notes/${id}`, dto));
  },

  /**
   * Menghapus notulen rapat pengurus
   * Endpoint: DELETE /board-meeting-notes/:id
   */
  deleteBoardMeetingNote: (id: string): Promise<{ message: string }> => {
    return handleRequest(api.delete<{ message: string }>(`/board-meeting-notes/${id}`));
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


  /**
   * Mengambil semua saran dari anggota (Hak Akses: Pengurus)
   * Endpoint: GET /member-suggestion
   */
  getMemberSuggestions: (): Promise<MemberSuggestionResponse[]> => {
    return handleRequest(api.get<MemberSuggestionResponse[]>('/member-suggestion'));
  },

  /**
   * Mengirim tanggapan untuk sebuah saran (Hak Akses: Pengurus)
   * Endpoint: POST /member-suggestion/:id/respond
   */
  respondToSuggestion: (id: string, dto: RespondSuggestionDto): Promise<MemberSuggestionResponse> => {
    return handleRequest(api.post<MemberSuggestionResponse>(`/member-suggestion/${id}/respond`, dto));
  },

  /**
   * Menghapus saran anggota (Hak Akses: Pengurus)
   * Endpoint: DELETE /member-suggestion/:id
   */
  deleteMemberSuggestion: (id: string): Promise<{ message: string }> => {
    return handleRequest(api.delete<{ message: string }>(`/member-suggestion/${id}`));
  }  


};