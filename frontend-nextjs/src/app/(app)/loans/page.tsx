/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getLoans, createLoan, updateLoanStatus, cancelLoan } from '../../../services/loans.service';
import { getRooms } from '../../../services/rooms.service';
import type { Peminjaman, Ruang, StatusPengajuan } from '../../../types';
import { useAuthStore } from '../../../stores/authStore';

const STATUS_COLORS: Record<string, string> = {
  MENUNGGU: 'bg-amber-100 text-amber-700',
  DISETUJUI: 'bg-emerald-100 text-emerald-700',
  DITOLAK: 'bg-red-100 text-red-700',
  SELESAI: 'bg-slate-100 text-slate-700',
};

export default function LoansPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isDosen = user?.role === 'DOSEN';

  const [loans, setLoans] = useState<Peminjaman[]>([]);
  const [rooms, setRooms] = useState<Ruang[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusPengajuan | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ruangId: 0, keperluan: '', tanggalMulai: '', tanggalSelesai: '' });

  const loadLoans = async (status?: StatusPengajuan) => {
    setLoading(true);
    try {
      const data = await getLoans({ status: status || undefined });
      setLoans(data);
    } catch {
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
    if (isDosen) {
      getRooms().then(setRooms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (status: StatusPengajuan | '') => {
    setStatusFilter(status);
    loadLoans(status || undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLoan(form);
      toast.success('Pengajuan berhasil dibuat');
      setShowModal(false);
      setForm({ ruangId: 0, keperluan: '', tanggalMulai: '', tanggalSelesai: '' });
      loadLoans(statusFilter || undefined);
    } catch (err: unknown) {
      // @ts-expect-error axios error shape
      toast.error(err.response?.data?.message || 'Gagal membuat pengajuan');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await updateLoanStatus(id, 'DISETUJUI');
      toast.success('Pengajuan disetujui');
      loadLoans(statusFilter || undefined);
    } catch (err: unknown) {
      // @ts-expect-error axios error shape
      toast.error(err.response?.data?.message || 'Gagal menyetujui pengajuan');
    }
  };

  const handleReject = async (id: number) => {
    const catatan = prompt('Alasan penolakan (opsional):') || undefined;
    try {
      await updateLoanStatus(id, 'DITOLAK', catatan);
      toast.success('Pengajuan ditolak');
      loadLoans(statusFilter || undefined);
    } catch (err: unknown) {
      // @ts-expect-error axios error shape
      toast.error(err.response?.data?.message || 'Gagal menolak pengajuan');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Batalkan pengajuan ini?')) return;
    try {
      await cancelLoan(id);
      toast.success('Pengajuan dibatalkan');
      loadLoans(statusFilter || undefined);
    } catch (err: unknown) {
      // @ts-expect-error axios error shape
      toast.error(err.response?.data?.message || 'Gagal membatalkan pengajuan');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Pengajuan Peminjaman</h1>
          <p className="text-sm md:text-base text-slate-500">
            {isAdmin ? 'Kelola seluruh pengajuan peminjaman ruang' : 'Riwayat pengajuan peminjaman Anda'}
          </p>
        </div>
        {isDosen && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            + Ajukan Peminjaman
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(['', 'MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI'] as const).map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border shrink-0 ${
              statusFilter === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600'
            }`}
          >
            {s || 'Semua'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-6">Memuat...</p>
      ) : loans.length === 0 ? (
        <p className="text-center text-slate-400 py-6">Belum ada pengajuan.</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{loan.ruang.nama}</p>
                    {isAdmin && <p className="text-xs text-slate-500">{loan.user.name}</p>}
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[loan.status]}`}>
                    {loan.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">{loan.keperluan}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(loan.tanggalMulai), 'dd MMM yyyy, HH:mm')} - {format(new Date(loan.tanggalSelesai), 'HH:mm')}
                </p>
                {(isAdmin || isDosen) && loan.status === 'MENUNGGU' && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
                    {isAdmin && (
                      <>
                        <button onClick={() => handleApprove(loan.id)} className="text-emerald-600 text-xs font-medium">
                          Setujui
                        </button>
                        <button onClick={() => handleReject(loan.id)} className="text-red-600 text-xs font-medium">
                          Tolak
                        </button>
                      </>
                    )}
                    {isDosen && (
                      <button onClick={() => handleCancel(loan.id)} className="text-red-600 text-xs font-medium">
                        Batalkan
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3">Ruang</th>
                  {isAdmin && <th className="px-4 py-3">Pemohon</th>}
                  <th className="px-4 py-3">Keperluan</th>
                  <th className="px-4 py-3">Jadwal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{loan.ruang.nama}</td>
                    {isAdmin && <td className="px-4 py-3 text-slate-500">{loan.user.name}</td>}
                    <td className="px-4 py-3 text-slate-500">{loan.keperluan}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {format(new Date(loan.tanggalMulai), 'dd MMM yyyy, HH:mm')} - {format(new Date(loan.tanggalSelesai), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[loan.status]}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {isAdmin && loan.status === 'MENUNGGU' && (
                        <>
                          <button onClick={() => handleApprove(loan.id)} className="text-emerald-600 hover:underline text-xs font-medium">
                            Setujui
                          </button>
                          <button onClick={() => handleReject(loan.id)} className="text-red-600 hover:underline text-xs font-medium">
                            Tolak
                          </button>
                        </>
                      )}
                      {isDosen && loan.status === 'MENUNGGU' && (
                        <button onClick={() => handleCancel(loan.id)} className="text-red-600 hover:underline text-xs font-medium">
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Ajukan Peminjaman</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <select
                required
                value={form.ruangId || ''}
                onChange={(e) => setForm({ ...form, ruangId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Pilih ruang</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama} {r.namaGedung ? `— ${r.namaGedung}` : ''} (kap. {r.kapasitas})
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Keperluan"
                value={form.keperluan}
                onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <div>
                <label className="text-xs text-slate-500">Waktu mulai</label>
                <input
                  required
                  type="datetime-local"
                  value={form.tanggalMulai}
                  onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Waktu selesai</label>
                <input
                  required
                  type="datetime-local"
                  value={form.tanggalSelesai}
                  onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}