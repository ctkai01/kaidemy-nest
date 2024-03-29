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

export class CreateQuizDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  description: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  curriculumID: number;
}
