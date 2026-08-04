import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusPengajuan } from '@prisma/client';

export class UpdateLoanStatusDto {
  @IsEnum(StatusPengajuan)
  status!: StatusPengajuan;

  @IsOptional()
  @IsString()
  catatanAdmin?: string;
}