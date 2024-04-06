import { Transform, Type } from 'class-transformer';
import {
  isDecimal,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  categoryID: number;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  subCategoryID: number;
}


