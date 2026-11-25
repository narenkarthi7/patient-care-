import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength, MaxLength } from 'class-validator';
import { Gender } from '../patient.entity';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsInt()
  @Min(0)
  @Max(125)
  age!: number;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  phone!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(3)
  address!: string;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(125)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  address?: string;
}
