import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CourseUtil } from 'src/constants';

export class UpdateLearningDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  @Min(1)
  @Max(100)
  process: number;

  @Transform(({ value, key, obj, type }) => +value)
  @IsEnum(CourseUtil)
  type: number;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  @Min(1)
  @Max(5)
  starCount: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  comment: string;
}
