import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Hanya guard untuk area admin
  if (!pathname.startsWith('/dashboard/admin')) {
    return NextResponse.next();
  }

  // Ambil hint dari cookie (diset client setelah login/fetch profil)
  const role = req.cookies.get('role')?.value;
  const isBendahara = req.cookies.get('isBendahara')?.value === '1';

  // Jika hint belum tersedia, biarkan client-side guard yang menangani
  if (!role) {
    return NextResponse.next();
  }

  const isAdminRoot = pathname === '/dashboard/admin';
  const isSimpanan = pathname.startsWith('/dashboard/admin/simpanan-anggota');
  const isPinjaman = pathname.startsWith('/dashboard/admin/pinjaman-anggota');
  const isInventaris = pathname.startsWith('/dashboard/admin/daftar-inventaris');
  const isKatalog = pathname.startsWith('/dashboard/admin/website/katalog');
  const isPengaturan = pathname.startsWith('/dashboard/admin/sistem/pengaturan');

  // Pengurus Bendahara: izinkan Simpanan, Pinjaman, Inventaris, Katalog, Pengaturan, dan root admin
  if (role === 'Pengurus' && isBendahara) {
    const allowed =
      isAdminRoot ||
      isSimpanan ||
      isPinjaman ||
      isInventaris ||
      isKatalog ||
      isPengaturan;
    if (!allowed) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard/admin';
      url.searchParams.set('denied', '1');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Pengurus non‑Bendahara: blokir simpanan & pinjaman
  if (role === 'Pengurus' && !isBendahara) {
    if (isSimpanan || isPinjaman) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard/admin';
      url.searchParams.set('denied', '1');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Pengawas: blokir simpanan & pinjaman
  if (role === 'Pengawas') {
    if (isSimpanan || isPinjaman) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard/admin';
      url.searchParams.set('denied', '1');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/admin/:path*'],
};

