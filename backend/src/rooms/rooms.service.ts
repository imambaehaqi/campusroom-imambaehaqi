import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';

interface ExternalRoom {
  id: string;
  kode_ruang: string;
  nama_ruangan: string;
  nama_gedung: string;
  kapasitas_ruang: number;
  jenis_ruang: string;
}

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async findAll(query: QueryRoomDto) {
    const { search, jenisRuang, namaGedung } = query;

    return this.prisma.ruang.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { nama: { contains: search } },
                  { namaGedung: { contains: search } },
                  { kodeRuang: { contains: search } },
                ],
              }
            : {},
          jenisRuang ? { jenisRuang } : {},
          namaGedung ? { namaGedung } : {},
        ],
      },
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: number) {
    const ruang = await this.prisma.ruang.findUnique({ where: { id } });
    if (!ruang) {
      throw new NotFoundException('Ruang tidak ditemukan');
    }
    return ruang;
  }

  async create(dto: CreateRoomDto) {
    return this.prisma.ruang.create({ data: dto });
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.ruang.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);

    const activeLoan = await this.prisma.peminjaman.findFirst({
      where: {
        ruangId: id,
        status: { in: ['MENUNGGU', 'DISETUJUI'] },
      },
    });

    if (activeLoan) {
      throw new ConflictException(
        'Ruang tidak dapat dihapus karena masih memiliki pengajuan aktif',
      );
    }

    return this.prisma.ruang.delete({ where: { id } });
  }

  async syncFromWebService() {
    const url =
      this.configService.get<string>('ROOMS_WEBSERVICE_URL') ??
      'https://api-ruangan.vercel.app/rooms';

    const response = await firstValueFrom(
      this.httpService.get<ExternalRoom[]>(url),
    );

    const externalRooms = response.data;
    let created = 0;
    let updated = 0;

    for (const item of externalRooms) {
      const existing = await this.prisma.ruang.findUnique({
        where: { externalId: item.id },
      });

      const data = {
        externalId: item.id,
        kodeRuang: item.kode_ruang,
        nama: item.nama_ruangan,
        namaGedung: item.nama_gedung,
        kapasitas: item.kapasitas_ruang,
        jenisRuang: item.jenis_ruang,
      };

      if (existing) {
        await this.prisma.ruang.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        await this.prisma.ruang.create({ data });
        created++;
      }
    }

    return {
      message: 'Sinkronisasi berhasil',
      totalFromWebService: externalRooms.length,
      created,
      updated,
    };
  }
}