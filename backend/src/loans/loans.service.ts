import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusPengajuan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { QueryLoanDto } from './dto/query-loan.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  private async checkConflict(
    ruangId: number,
    tanggalMulai: Date,
    tanggalSelesai: Date,
    excludeLoanId?: number,
  ) {
    // Bentrok terjadi jika ada peminjaman DISETUJUI di ruang yang sama
    // dengan rentang waktu yang overlap: mulai < selesaiLain DAN selesai > mulaiLain
    const conflict = await this.prisma.peminjaman.findFirst({
      where: {
        id: excludeLoanId ? { not: excludeLoanId } : undefined,
        ruangId,
        status: StatusPengajuan.DISETUJUI,
        tanggalMulai: { lt: tanggalSelesai },
        tanggalSelesai: { gt: tanggalMulai },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Ruang sudah dipinjam pada rentang waktu tersebut',
      );
    }
  }

  async create(userId: number, dto: CreateLoanDto) {
    const tanggalMulai = new Date(dto.tanggalMulai);
    const tanggalSelesai = new Date(dto.tanggalSelesai);

    if (tanggalSelesai <= tanggalMulai) {
      throw new BadRequestException(
        'Tanggal selesai harus setelah tanggal mulai',
      );
    }

    const ruang = await this.prisma.ruang.findUnique({
      where: { id: dto.ruangId },
    });
    if (!ruang) {
      throw new NotFoundException('Ruang tidak ditemukan');
    }

    // Cek bentrok saat pengajuan dibuat (mencegah pengajuan yang pasti akan ditolak)
    await this.checkConflict(dto.ruangId, tanggalMulai, tanggalSelesai);

    return this.prisma.peminjaman.create({
      data: {
        ruangId: dto.ruangId,
        userId,
        keperluan: dto.keperluan,
        tanggalMulai,
        tanggalSelesai,
        status: StatusPengajuan.MENUNGGU,
      },
      include: { ruang: true, user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(query: QueryLoanDto, currentUser: { userId: number; role: Role }) {
    const { status, search } = query;

    return this.prisma.peminjaman.findMany({
      where: {
        // Dosen hanya bisa lihat riwayat pengajuannya sendiri
        userId: currentUser.role === Role.DOSEN ? currentUser.userId : undefined,
        status: status ?? undefined,
        keperluan: search ? { contains: search } : undefined,
      },
      include: {
        ruang: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, currentUser: { userId: number; role: Role }) {
    const loan = await this.prisma.peminjaman.findUnique({
      where: { id },
      include: {
        ruang: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!loan) {
      throw new NotFoundException('Pengajuan tidak ditemukan');
    }

    if (currentUser.role === Role.DOSEN && loan.userId !== currentUser.userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pengajuan ini');
    }

    return loan;
  }

  async updateStatus(id: number, dto: UpdateLoanStatusDto) {
    const loan = await this.prisma.peminjaman.findUnique({ where: { id } });
    if (!loan) {
      throw new NotFoundException('Pengajuan tidak ditemukan');
    }

    if (loan.status !== StatusPengajuan.MENUNGGU) {
      throw new BadRequestException(
        'Hanya pengajuan berstatus MENUNGGU yang dapat diproses',
      );
    }

    // Validasi ulang bentrok jadwal tepat sebelum disetujui (data bisa berubah sejak pengajuan dibuat)
    if (dto.status === StatusPengajuan.DISETUJUI) {
      await this.checkConflict(
        loan.ruangId,
        loan.tanggalMulai,
        loan.tanggalSelesai,
        loan.id,
      );
    }

    return this.prisma.peminjaman.update({
      where: { id },
      data: {
        status: dto.status,
        catatanAdmin: dto.catatanAdmin,
      },
      include: { ruang: true, user: { select: { id: true, name: true, email: true } } },
    });
  }

  async cancel(id: number, currentUser: { userId: number; role: Role }) {
    const loan = await this.prisma.peminjaman.findUnique({ where: { id } });
    if (!loan) {
      throw new NotFoundException('Pengajuan tidak ditemukan');
    }

    if (currentUser.role === Role.DOSEN && loan.userId !== currentUser.userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pengajuan ini');
    }

    if (loan.status !== StatusPengajuan.MENUNGGU) {
      throw new BadRequestException('Hanya pengajuan MENUNGGU yang dapat dibatalkan');
    }

    return this.prisma.peminjaman.update({
      where: { id },
      data: { status: StatusPengajuan.DITOLAK, catatanAdmin: 'Dibatalkan oleh pemohon' },
    });
  }

  // Dipanggil scheduler/cron atau manual: tandai peminjaman yang sudah lewat sebagai SELESAI
  async markCompleted() {
    const now = new Date();
    const result = await this.prisma.peminjaman.updateMany({
      where: {
        status: StatusPengajuan.DISETUJUI,
        tanggalSelesai: { lt: now },
      },
      data: { status: StatusPengajuan.SELESAI },
    });
    return { updated: result.count };
  }
}