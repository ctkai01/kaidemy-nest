import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  isDecimal,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  welcomeMessage: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  congratulationsMessage: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  subtitle: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  primarilyTeach: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  languageID: number;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  priceID: number;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  categoryID: number;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  subCategoryID: number;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  levelID: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(150, { each: true })
  outcomes: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(150, { each: true })
  requirements: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(150, { each: true })
  intendedFor: string[];
}