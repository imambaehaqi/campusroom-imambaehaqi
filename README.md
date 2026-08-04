# CampusRoom — Sistem Peminjaman Ruang Universitas

Aplikasi manajemen peminjaman ruang kelas, laboratorium, dan ruang pertemuan di lingkungan universitas. Mendukung dua role: **Admin** (mengelola data ruang & menyetujui/menolak pengajuan) dan **Dosen** (mengajukan peminjaman ruang).

## Tech Stack

**Backend**
- NestJS (Node.js framework)
- Prisma ORM + MySQL
- JWT Authentication (Passport)
- class-validator untuk validasi request

**Frontend**
- React + Vite + TypeScript
- TailwindCSS
- React Router v7
- Zustand (state management)
- Axios
- React Hot Toast

## Struktur Project

```
campusroom-imambaehaqi/
├── backend/          # NestJS REST API
│   ├── prisma/       # Schema, migration, seeder
│   └── src/
│       ├── auth/
│       ├── rooms/
│       ├── loans/
│       ├── dashboard/
│       ├── prisma/
│       └── common/   # Guards, decorators
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── stores/
│       ├── routes/
│       └── types/
└── README.md
```

## Fitur

- ✅ Authentication berbasis JWT (Admin & Dosen)
- ✅ Role-based access control & middleware
- ✅ CRUD Data Ruang
- ✅ Sinkronisasi data ruang dari webservice eksternal (`api-ruangan.vercel.app/rooms`)
- ✅ CRUD Pengajuan Peminjaman
- ✅ Approval / Reject oleh Admin
- ✅ Validasi anti-bentrok jadwal (tidak boleh dua peminjaman disetujui di ruang & waktu yang sama)
- ✅ Dashboard ringkasan peminjaman (statistik, riwayat terbaru, jadwal mendatang, ruang terpopuler)
- ✅ Pencarian & filter data ruang dan pengajuan
- ⏳ Automated testing (menyusul)
- ✅ UI responsif dengan TailwindCSS

## Aturan Bisnis

- Dosen hanya dapat mengajukan peminjaman ruang.
- Admin dapat menyetujui atau menolak pengajuan.
- Ruangan yang telah disetujui tidak dapat dipinjam pada waktu yang bentrok (overlap).
- Status pengajuan: `MENUNGGU`, `DISETUJUI`, `DITOLAK`, `SELESAI`.
- Riwayat peminjaman tersimpan permanen di database.

---

## Instalasi & Menjalankan Aplikasi

### Prasyarat

- Node.js v20+ (`node -v` untuk cek)
- MySQL Server (bisa via XAMPP, Laragon, atau MySQL standalone)
- Git

### 1. Clone repository

```bash
git clone git@github.com:imambaehaqi/campusroom-imambaehaqi.git
cd campusroom-imambaehaqi
```

### 2. Setup Database

Buat database MySQL baru:

```sql
CREATE DATABASE campusroom;
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/` (copy dari `.env.example`):

```env
DATABASE_URL="mysql://root:@localhost:3306/campusroom"
JWT_SECRET="ganti_dengan_secret_yang_kuat"
JWT_EXPIRES_IN="1d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
ROOMS_WEBSERVICE_URL="https://api-ruangan.vercel.app/rooms"
```

> Sesuaikan `root:@` dengan username/password MySQL kamu.

Jalankan migration & seeder:

```bash
npx prisma migrate dev
npx prisma db seed
```

Jalankan server backend:

```bash
npm run start:dev
```

Backend berjalan di `http://localhost:3000`.

### 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
```

Buat file `.env` di folder `frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

Jalankan dev server:

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### 5. Sinkronisasi Data Ruang (opsional, setelah login sebagai Admin)

Login sebagai admin, lalu klik tombol **"Sync Webservice"** di halaman Data Ruang, atau panggil langsung:

```
POST http://localhost:3000/rooms/sync/webservice
Authorization: Bearer <token_admin>
```

---

## Akun Login Default (hasil seeder)

| Role  | Email                          | Password      |
|-------|--------------------------------|----------------|
| Admin | admin@campusroom.test          | password123    |
| Dosen | ahmad.fauzi@campusroom.test    | password123    |
| Dosen | siti.nurhaliza@campusroom.test | password123    |
| Dosen | budi.santoso@campusroom.test   | password123    |

*(9 akun dosen lainnya tersedia dengan pola email serupa, lihat `backend/prisma/seed.ts`)*

---

## API Endpoints Utama

| Method | Endpoint                     | Akses         | Deskripsi                          |
|--------|-------------------------------|----------------|-------------------------------------|
| POST   | `/auth/login`                 | Public         | Login, mengembalikan JWT token      |
| GET    | `/auth/me`                    | Authenticated  | Profil user yang sedang login       |
| GET    | `/rooms`                      | Authenticated  | List ruang (search & filter)        |
| POST   | `/rooms`                      | Admin          | Tambah ruang                        |
| PUT    | `/rooms/:id`                  | Admin          | Update ruang                        |
| DELETE | `/rooms/:id`                  | Admin          | Hapus ruang                         |
| POST   | `/rooms/sync/webservice`      | Admin          | Sinkronisasi dari webservice        |
| GET    | `/loans`                      | Authenticated  | List pengajuan (filter status)      |
| POST   | `/loans`                      | Dosen          | Ajukan peminjaman                   |
| PATCH  | `/loans/:id/status`           | Admin          | Approve/reject pengajuan            |
| PATCH  | `/loans/:id/cancel`           | Pemilik/Dosen  | Batalkan pengajuan (status MENUNGGU)|
| GET    | `/dashboard/summary`          | Authenticated  | Ringkasan dashboard (adaptif role)  |

---

## Catatan Teknis

- Validasi anti-bentrok jadwal dilakukan dua kali: saat pengajuan dibuat (mencegah pengajuan yang pasti bentrok) dan saat admin menyetujui (memastikan data terkini, karena kondisi bisa berubah antara waktu pengajuan dan approval).
- Sinkronisasi ruang dari webservice bersifat idempotent — menggunakan `externalId` sebagai key unik sehingga aman dijalankan berulang kali tanpa membuat data duplikat.
- Dashboard menyesuaikan tampilan berdasarkan role: Dosen melihat ringkasan pengajuannya sendiri, Admin melihat ringkasan sistem secara keseluruhan.

## Kontak

Imam Baehaqi — dikerjakan sebagai bagian dari tes seleksi Programmer.