export type Role = 'ADMIN' | 'DOSEN';
export type StatusPengajuan = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Ruang {
  id: number;
  externalId?: string | null;
  kodeRuang?: string | null;
  nama: string;
  namaGedung?: string | null;
  kapasitas: number;
  jenisRuang?: string | null;
  deskripsi?: string | null;
}

export interface Peminjaman {
  id: number;
  ruangId: number;
  userId: number;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: StatusPengajuan;
  catatanAdmin?: string | null;
  createdAt: string;
  ruang: Ruang;
  user: { id?: number; name: string; email?: string };
}

export interface DashboardSummary {
  totalRuang: number;
  statistikPengajuan: {
    total: number;
    menunggu: number;
    disetujui: number;
    ditolak: number;
    selesai: number;
  };
  recentLoans: Peminjaman[];
  upcomingApproved: Peminjaman[];
  mostBookedRooms?: { ruang: Ruang; totalPeminjaman: number }[];
}