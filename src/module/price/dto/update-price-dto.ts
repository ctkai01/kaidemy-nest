import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePriceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsOptional()
  tier?: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  @IsOptional()
  value?: number;
}
