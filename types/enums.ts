// frontend/types/enums.ts

/**
 * Sesuai dengan enum Gender di backend/prisma/schema.prisma
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

/**
 * WAJIB Sesuai dengan backend/src/auth/enums/role.enum.ts
 * Perhatikan penggunaan PascalCase, bukan UPPER_CASE.
 */
export enum Role {
  Pengurus = 'Pengurus',
  Anggota = 'Anggota',
  Pengawas = 'Pengawas',
}

/**
 * BARU! WAJIB Sesuai dengan backend/src/auth/enums/jabatan-pengurus.enum.ts
 */
export enum JabatanPengurus {
  KETUA = 'Ketua',
  SEKRETARIS = 'Sekretaris',
  BENDAHARA = 'Bendahara',
}