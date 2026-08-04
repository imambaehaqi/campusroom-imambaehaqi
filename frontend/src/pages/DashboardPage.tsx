import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboard.service';
import type { DashboardSummary } from '../types';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  MENUNGGU: 'bg-amber-100 text-amber-700',
  DISETUJUI: 'bg-emerald-100 text-emerald-700',
  DITOLAK: 'bg-red-100 text-red-700',
  SELESAI: 'bg-slate-100 text-slate-700',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Memuat dashboard...</p>;
  }

  if (!data) {
    return <p className="text-red-500">Gagal memuat data dashboard.</p>;
  }

  const cards = [
    { label: 'Total Ruang', value: data.totalRuang, color: 'bg-primary-50 text-primary-700' },
    { label: 'Total Pengajuan', value: data.statistikPengajuan.total, color: 'bg-slate-100 text-slate-700' },
    { label: 'Menunggu', value: data.statistikPengajuan.menunggu, color: 'bg-amber-50 text-amber-700' },
    { label: 'Disetujui', value: data.statistikPengajuan.disetujui, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">Ringkasan aktivitas peminjaman ruang</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Pengajuan Terbaru</h2>
          <div className="space-y-3">
            {data.recentLoans.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada pengajuan.</p>
            )}
            {data.recentLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-700">{loan.ruang.nama}</p>
                  <p className="text-slate-400 text-xs">{loan.user.name} — {loan.keperluan}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[loan.status]}`}>
                  {loan.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Jadwal Mendatang (Disetujui)</h2>
          <div className="space-y-3">
            {data.upcomingApproved.length === 0 && (
              <p className="text-sm text-slate-400">Tidak ada jadwal mendatang.</p>
            )}
            {data.upcomingApproved.map((loan) => (
              <div key={loan.id} className="text-sm">
                <p className="font-medium text-slate-700">{loan.ruang.nama}</p>
                <p className="text-slate-400 text-xs">
                  {format(new Date(loan.tanggalMulai), 'dd MMM yyyy, HH:mm')} —{' '}
                  {format(new Date(loan.tanggalSelesai), 'HH:mm')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.mostBookedRooms && data.mostBookedRooms.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6">
          <h2 className="font-semibold text-slate-800 mb-4">Ruang Paling Sering Dipinjam</h2>
          <div className="space-y-2">
            {data.mostBookedRooms.map((item) => (
              <div key={item.ruang.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.ruang.nama}</span>
                <span className="text-slate-400">{item.totalPeminjaman}x dipinjam</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}