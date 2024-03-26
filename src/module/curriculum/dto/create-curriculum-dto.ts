import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCurriculumDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsOptional()
  @MinLength(1)
  @MaxLength(1000)
  description: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  courseID: number;
}
