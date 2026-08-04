import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateLoanDto {
  @IsInt()
  ruangId!: number;

  @IsString()
  @IsNotEmpty()
  keperluan!: string;

  @IsDateString()
  tanggalMulai!: string;

  @IsDateString()
  tanggalSelesai!: string;
}