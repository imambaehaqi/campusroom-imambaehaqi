import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    { name: 'Admin Utama', email: 'admin@campusroom.test', role: Role.ADMIN },
    { name: 'Dr. Ahmad Fauzi', email: 'ahmad.fauzi@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Siti Nurhaliza', email: 'siti.nurhaliza@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Budi Santoso', email: 'budi.santoso@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Rina Marlina', email: 'rina.marlina@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Hendra Wijaya', email: 'hendra.wijaya@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Dewi Lestari', email: 'dewi.lestari@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Fajar Nugroho', email: 'fajar.nugroho@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Maya Sari', email: 'maya.sari@campusroom.test', role: Role.DOSEN },
    { name: 'Dr. Agus Setiawan', email: 'agus.setiawan@campusroom.test', role: Role.DOSEN },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: passwordHash },
    });
  }

  const ruangData = [
    { nama: 'Ruang A101', namaGedung: 'Gedung A', kapasitas: 40, jenisRuang: 'kelas', deskripsi: 'Ruang kelas reguler' },
    { nama: 'Ruang A102', namaGedung: 'Gedung A', kapasitas: 40, jenisRuang: 'kelas', deskripsi: 'Ruang kelas reguler' },
    { nama: 'Ruang B201', namaGedung: 'Gedung B', kapasitas: 60, jenisRuang: 'seminar', deskripsi: 'Ruang seminar' },
    { nama: 'Ruang B202', namaGedung: 'Gedung B', kapasitas: 60, jenisRuang: 'seminar', deskripsi: 'Ruang seminar' },
    { nama: 'Lab Komputer 1', namaGedung: 'Gedung C', kapasitas: 30, jenisRuang: 'lab', deskripsi: 'Lab praktikum komputer' },
    { nama: 'Lab Komputer 2', namaGedung: 'Gedung C', kapasitas: 30, jenisRuang: 'lab', deskripsi: 'Lab praktikum komputer' },
    { nama: 'Aula Utama', namaGedung: 'Gedung Rektorat', kapasitas: 200, jenisRuang: 'aula', deskripsi: 'Aula untuk acara besar' },
    { nama: 'Ruang Rapat 1', namaGedung: 'Gedung Rektorat', kapasitas: 15, jenisRuang: 'rapat', deskripsi: 'Ruang rapat kecil' },
    { nama: 'Ruang Rapat 2', namaGedung: 'Gedung Rektorat', kapasitas: 15, jenisRuang: 'rapat', deskripsi: 'Ruang rapat kecil' },
    { nama: 'Ruang C301', namaGedung: 'Gedung C', kapasitas: 50, jenisRuang: 'kelas', deskripsi: 'Ruang kelas reguler' },
  ];

  for (const r of ruangData) {
    const existing = await prisma.ruang.findFirst({ where: { nama: r.nama } });
    if (!existing) {
      await prisma.ruang.create({ data: r });
    }
  }

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });