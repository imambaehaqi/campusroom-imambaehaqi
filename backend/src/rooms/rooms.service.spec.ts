import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: {
    ruang: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    peminjaman: { findFirst: jest.Mock };
  };
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      ruang: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      peminjaman: { findFirst: jest.fn() },
    };
    httpService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: prisma },
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a room by id', async () => {
    prisma.ruang.findUnique.mockResolvedValue({ id: 1, nama: 'Ruang A101' });

    const result = await service.findOne(1);

    expect(result.nama).toBe('Ruang A101');
  });

  it('should throw NotFoundException when room id does not exist', async () => {
    prisma.ruang.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should sync rooms from webservice and create new entries', async () => {
    httpService.get.mockReturnValue(
      of({
        data: [
          {
            id: 'ext-1',
            kode_ruang: 'A101',
            nama_ruangan: 'Ruang A101',
            nama_gedung: 'Gedung A',
            kapasitas_ruang: 40,
            jenis_ruang: 'kelas',
          },
        ],
      }),
    );
    prisma.ruang.findUnique.mockResolvedValue(null); // belum ada, jadi create
    prisma.ruang.create.mockResolvedValue({});

    const result = await service.syncFromWebService();

    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(prisma.ruang.create).toHaveBeenCalled();
  });
});
