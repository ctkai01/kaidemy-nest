import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePriceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  tier: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  value: number;
}
