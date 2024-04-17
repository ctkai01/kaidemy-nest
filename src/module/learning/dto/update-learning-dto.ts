import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CourseUtil } from 'src/constants';

export class UpdateLearningDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  @MinLength(1)
  @MaxLength(100)
  process: number;

  @IsOptional()
  @IsEnum(CourseUtil)
  type: number;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  @MinLength(1)
  @MaxLength(5)
  starCount: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  comment: string;
}
