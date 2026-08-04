import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusPengajuan } from '@prisma/client';

export class QueryLoanDto {
  @IsOptional()
  @IsEnum(StatusPengajuan)
  status?: StatusPengajuan;

  @IsOptional()
  @IsString()
  search?: string; // cari di keperluan / nama ruang
}