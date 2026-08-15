# CampusRoom — Sistem Peminjaman Ruang Universitas

Aplikasi manajemen peminjaman ruang kelas, laboratorium, dan ruang pertemuan di lingkungan universitas. Mendukung dua role: **Admin** (mengelola data ruang & menyetujui/menolak pengajuan) dan **Dosen** (mengajukan peminjaman ruang).

## Tech Stack

**Backend**
- NestJS (Node.js framework)
- Prisma ORM + MySQL
- JWT Authentication (Passport)
- class-validator untuk validasi request
- Jest untuk automated testing

**Frontend**
- React + Vite + TypeScript
- TailwindCSS
- React Router v7
- Zustand (state management)
- Axios
- React Hot Toast
- Vitest + Testing Library untuk automated testing

## Struktur Project

```
campusroom-imambaehaqi/
├── backend/          # NestJS REST API
│   ├── prisma/       # Schema, migration, seeder
│   └── src/
│       ├── auth/          # Login, JWT strategy
│       ├── rooms/         # CRUD ruang + sinkronisasi webservice
│       ├── loans/         # CRUD pengajuan peminjaman + approval
│       ├── dashboard/     # Ringkasan statistik
│       ├── prisma/        # PrismaService
│       └── common/        # Guards & decorators (roles, current-user)
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/          # Login, Dashboard, Rooms, Loans
│       ├── components/     # Layout
│       ├── services/       # API calls (axios)
│       ├── stores/          # Zustand auth store
│       ├── routes/         # ProtectedRoute
│       └── types/          # TypeScript interfaces
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
- ✅ Automated testing (21 test case — 16 backend, 5 frontend)
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

Jika belum setup SSH key untuk GitHub, gunakan HTTPS:
```bash
git clone https://github.com/imambaehaqi/campusroom-imambaehaqi.git
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

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/campusroom"
JWT_SECRET="ganti_dengan_secret_yang_kuat"
JWT_EXPIRES_IN="1d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
ROOMS_WEBSERVICE_URL="https://api-ruangan.vercel.app/rooms"
```

> Sesuaikan `root:password` dengan username/password MySQL kamu.

Jalankan migration & seeder:

```bash
npx prisma migrate dev
npx prisma generate
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

Login sebagai admin, lalu klik tombol **"Sync Webservice"** di halaman Data Ruang.

---

## Menjalankan Automated Testing

### Backend (Jest — 16 test case)

```bash
cd backend
npm run test
```

Mencakup:
- `auth.service.spec.ts` — validasi login, hashing password, JWT payload
- `loans.service.spec.ts` — validasi anti-bentrok jadwal, approval flow, error handling
- `rooms.service.spec.ts` — CRUD ruang, sinkronisasi webservice

### Frontend (Vitest — 5 test case)

```bash
cd frontend
npm run test
```

Mencakup:
- `authStore.test.ts` — state management login/logout
- `LoginPage.test.tsx` — rendering form & submit flow

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
- Import TypeScript interface/type menggunakan `import type` untuk kompatibilitas dengan `verbatimModuleSyntax` di Vite/TypeScript versi terbaru.

## Kontak

Imam Baehaqi — dikerjakan sebagai bagian dari tes seleksi Programmer.