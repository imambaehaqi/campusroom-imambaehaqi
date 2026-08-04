import { IsOptional, IsString } from 'class-validator';

export class QueryRoomDto {
  @IsOptional()
  @IsString()
  search?: string; // cari di nama / namaGedung

  @IsOptional()
  @IsString()
  jenisRuang?: string;

  @IsOptional()
  @IsString()
  namaGedung?: string;
}