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

export class CreateLectureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  curriculumID: number;
}
