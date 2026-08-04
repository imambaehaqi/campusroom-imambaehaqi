import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Users: 1 admin + 9 dosen (total 10)
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

  // Ruang: 10 data
  const ruangData = [
    { nama: 'Ruang A101', lokasi: 'Gedung A Lt.1', kapasitas: 40, deskripsi: 'Ruang kelas reguler' },
    { nama: 'Ruang A102', lokasi: 'Gedung A Lt.1', kapasitas: 40, deskripsi: 'Ruang kelas reguler' },
    { nama: 'Ruang B201', lokasi: 'Gedung B Lt.2', kapasitas: 60, deskripsi: 'Ruang seminar' },
    { nama: 'Ruang B202', lokasi: 'Gedung B Lt.2', kapasitas: 60, deskripsi: 'Ruang seminar' },
    { nama: 'Lab Komputer 1', lokasi: 'Gedung C Lt.1', kapasitas: 30, deskripsi: 'Lab praktikum komputer' },
    { nama: 'Lab Komputer 2', lokasi: 'Gedung C Lt.1', kapasitas: 30, deskripsi: 'Lab praktikum komputer' },
    { nama: 'Aula Utama', lokasi: 'Gedung Rektorat', kapasitas: 200, deskripsi: 'Aula untuk acara besar' },
    { nama: 'Ruang Rapat 1', lokasi: 'Gedung Rektorat Lt.2', kapasitas: 15, deskripsi: 'Ruang rapat kecil' },
    { nama: 'Ruang Rapat 2', lokasi: 'Gedung Rektorat Lt.2', kapasitas: 15, deskripsi: 'Ruang rapat kecil' },
    { nama: 'Ruang C301', lokasi: 'Gedung C Lt.3', kapasitas: 50, deskripsi: 'Ruang kelas reguler' },
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