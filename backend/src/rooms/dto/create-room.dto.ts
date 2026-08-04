import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsOptional()
  @IsString()
  namaGedung?: string;

  @IsInt()
  @Min(1)
  kapasitas!: number;

  @IsOptional()
  @IsString()
  jenisRuang?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}