import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getRooms, createRoom, updateRoom, deleteRoom, syncRooms } from '../services/rooms.service';
import type { Ruang } from '../types';
import { useAuthStore } from '../stores/authStore';

const emptyForm = { nama: '', namaGedung: '', kapasitas: 0, jenisRuang: '', deskripsi: '' };

export default function RoomsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [rooms, setRooms] = useState<Ruang[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [syncing, setSyncing] = useState(false);

  const loadRooms = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await getRooms({ search: searchTerm || undefined });
      setRooms(data);
    } catch {
      toast.error('Gagal memuat data ruang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRooms(search);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncRooms();
      toast.success(`Sinkronisasi selesai: ${result.created} baru, ${result.updated} diperbarui`);
      loadRooms();
    } catch {
      toast.error('Sinkronisasi gagal');
    } finally {
      setSyncing(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (room: Ruang) => {
    setEditingId(room.id);
    setForm({
      nama: room.nama,
      namaGedung: room.namaGedung || '',
      kapasitas: room.kapasitas,
      jenisRuang: room.jenisRuang || '',
      deskripsi: room.deskripsi || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRoom(editingId, form);
        toast.success('Ruang berhasil diperbarui');
      } else {
        await createRoom(form);
        toast.success('Ruang berhasil ditambahkan');
      }
      setShowModal(false);
      loadRooms(search);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan ruang');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus ruang ini?')) return;
    try {
      await deleteRoom(id);
      toast.success('Ruang berhasil dihapus');
      loadRooms(search);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus ruang');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Data Ruang</h1>
          <p className="text-sm md:text-base text-slate-500">Kelola data ruang universitas</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-60"
            >
              {syncing ? 'Menyinkronkan...' : 'Sync Webservice'}
            </button>
            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              + Tambah Ruang
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama ruang, gedung, atau kode..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
        />
        <button type="submit" className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900 shrink-0">
          Cari
        </button>
      </form>

      {loading ? (
        <p className="text-center text-slate-400 py-6">Memuat...</p>
      ) : rooms.length === 0 ? (
        <p className="text-center text-slate-400 py-6">Tidak ada data ruang.</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{room.nama}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{room.namaGedung || '-'}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 shrink-0 pt-0.5">
                      <button onClick={() => openEditModal(room)} className="text-primary-600 text-xs font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(room.id)} className="text-red-600 text-xs font-medium">
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <span>Kapasitas: <b className="text-slate-700">{room.kapasitas}</b></span>
                  <span className="capitalize">Jenis: <b className="text-slate-700">{room.jenisRuang || '-'}</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3">Nama Ruang</th>
                  <th className="px-4 py-3">Gedung</th>
                  <th className="px-4 py-3">Kapasitas</th>
                  <th className="px-4 py-3">Jenis</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{room.nama}</td>
                    <td className="px-4 py-3 text-slate-500">{room.namaGedung || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{room.kapasitas}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{room.jenisRuang || '-'}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => openEditModal(room)} className="text-primary-600 hover:underline text-xs font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:underline text-xs font-medium">
                          Hapus
                        </button>
                      </td>
                    )}
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
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Edit Ruang' : 'Tambah Ruang'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Nama ruang"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                placeholder="Nama gedung"
                value={form.namaGedung}
                onChange={(e) => setForm({ ...form, namaGedung: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                required
                type="number"
                min={1}
                placeholder="Kapasitas"
                value={form.kapasitas || ''}
                onChange={(e) => setForm({ ...form, kapasitas: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                placeholder="Jenis ruang (kelas/pertemuan/rapat)"
                value={form.jenisRuang}
                onChange={(e) => setForm({ ...form, jenisRuang: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <textarea
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}