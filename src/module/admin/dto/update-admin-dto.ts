import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
