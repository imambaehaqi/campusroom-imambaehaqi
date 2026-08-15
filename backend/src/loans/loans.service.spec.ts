import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StatusPengajuan } from '@prisma/client';
import { LoansService } from './loans.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LoansService', () => {
  let service: LoansService;
  let prisma: {
    peminjaman: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    ruang: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      peminjaman: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      ruang: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoansService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a loan request when no schedule conflict exists', async () => {
    prisma.ruang.findUnique.mockResolvedValue({ id: 1, nama: 'Ruang A101' });
    prisma.peminjaman.findFirst.mockResolvedValue(null); // tidak ada bentrok
    prisma.peminjaman.create.mockResolvedValue({
      id: 1,
      ruangId: 1,
      userId: 2,
      status: StatusPengajuan.MENUNGGU,
    });

    const result = await service.create(2, {
      ruangId: 1,
      keperluan: 'Kuliah Pengganti',
      tanggalMulai: '2026-09-01T08:00:00.000Z',
      tanggalSelesai: '2026-09-01T10:00:00.000Z',
    });

    expect(result.status).toBe(StatusPengajuan.MENUNGGU);
    expect(prisma.peminjaman.create).toHaveBeenCalled();
  });

  it('should reject loan request when schedule conflicts with an approved loan', async () => {
    prisma.ruang.findUnique.mockResolvedValue({ id: 1, nama: 'Ruang A101' });
    prisma.peminjaman.findFirst.mockResolvedValue({
      id: 99,
      ruangId: 1,
      status: StatusPengajuan.DISETUJUI,
    }); // ada bentrok

    await expect(
      service.create(2, {
        ruangId: 1,
        keperluan: 'Rapat Dadakan',
        tanggalMulai: '2026-09-01T09:00:00.000Z',
        tanggalSelesai: '2026-09-01T11:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject loan request when tanggalSelesai is before tanggalMulai', async () => {
    await expect(
      service.create(2, {
        ruangId: 1,
        keperluan: 'Invalid time',
        tanggalMulai: '2026-09-01T10:00:00.000Z',
        tanggalSelesai: '2026-09-01T08:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when room does not exist', async () => {
    prisma.ruang.findUnique.mockResolvedValue(null);

    await expect(
      service.create(2, {
        ruangId: 999,
        keperluan: 'Ruang tidak ada',
        tanggalMulai: '2026-09-01T08:00:00.000Z',
        tanggalSelesai: '2026-09-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should approve a MENUNGGU loan when no conflict exists', async () => {
    prisma.peminjaman.findUnique.mockResolvedValue({
      id: 1,
      ruangId: 1,
      status: StatusPengajuan.MENUNGGU,
      tanggalMulai: new Date('2026-09-01T08:00:00.000Z'),
      tanggalSelesai: new Date('2026-09-01T10:00:00.000Z'),
    });
    prisma.peminjaman.findFirst.mockResolvedValue(null);
    prisma.peminjaman.update.mockResolvedValue({
      id: 1,
      status: StatusPengajuan.DISETUJUI,
    });

    const result = await service.updateStatus(1, {
      status: StatusPengajuan.DISETUJUI,
    });

    expect(result.status).toBe(StatusPengajuan.DISETUJUI);
  });

  it('should reject approval if loan status is not MENUNGGU', async () => {
    prisma.peminjaman.findUnique.mockResolvedValue({
      id: 1,
      status: StatusPengajuan.DITOLAK,
    });

    await expect(
      service.updateStatus(1, { status: StatusPengajuan.DISETUJUI }),
    ).rejects.toThrow(BadRequestException);
  });
});
