import { Injectable } from '@nestjs/common';
import { Role, StatusPengajuan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

interface AuthUser {
  userId: number;
  role: Role;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(currentUser: AuthUser, query: DashboardQueryDto) {
    const isDosen = currentUser.role === Role.DOSEN;
    const userFilter = isDosen ? { userId: currentUser.userId } : {};

    const dateFilter: Record<string, any> = {};
    if (query.from) dateFilter.gte = new Date(query.from);
    if (query.to) dateFilter.lte = new Date(query.to);

    const baseWhere = {
      ...userFilter,
      ...(query.from || query.to ? { createdAt: dateFilter } : {}),
    };

    const [total, menunggu, disetujui, ditolak, selesai, totalRuang] =
      await Promise.all([
        this.prisma.peminjaman.count({ where: baseWhere }),
        this.prisma.peminjaman.count({
          where: { ...baseWhere, status: StatusPengajuan.MENUNGGU },
        }),
        this.prisma.peminjaman.count({
          where: { ...baseWhere, status: StatusPengajuan.DISETUJUI },
        }),
        this.prisma.peminjaman.count({
          where: { ...baseWhere, status: StatusPengajuan.DITOLAK },
        }),
        this.prisma.peminjaman.count({
          where: { ...baseWhere, status: StatusPengajuan.SELESAI },
        }),
        this.prisma.ruang.count(),
      ]);

    const recentLoans = await this.prisma.peminjaman.findMany({
      where: userFilter,
      include: {
        ruang: { select: { nama: true, namaGedung: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const upcomingApproved = await this.prisma.peminjaman.findMany({
      where: {
        ...userFilter,
        status: StatusPengajuan.DISETUJUI,
        tanggalMulai: { gte: new Date() },
      },
      include: {
        ruang: { select: { nama: true, namaGedung: true } },
        user: { select: { name: true } },
      },
      orderBy: { tanggalMulai: 'asc' },
      take: 5,
    });

    // Ruang paling sering dipinjam (khusus Admin, insight keseluruhan sistem)
    let mostBookedRooms: any[] = [];
    if (!isDosen) {
      const grouped = await this.prisma.peminjaman.groupBy({
        by: ['ruangId'],
        where: { status: { in: [StatusPengajuan.DISETUJUI, StatusPengajuan.SELESAI] } },
        _count: { ruangId: true },
        orderBy: { _count: { ruangId: 'desc' } },
        take: 5,
      });

      const ruangIds = grouped.map((g) => g.ruangId);
      const ruangDetails = await this.prisma.ruang.findMany({
        where: { id: { in: ruangIds } },
      });

      mostBookedRooms = grouped.map((g) => ({
        ruang: ruangDetails.find((r) => r.id === g.ruangId),
        totalPeminjaman: g._count.ruangId,
      }));
    }

    return {
      totalRuang,
      statistikPengajuan: {
        total,
        menunggu,
        disetujui,
        ditolak,
        selesai,
      },
      recentLoans,
      upcomingApproved,
      ...(isDosen ? {} : { mostBookedRooms }),
    };
  }
}