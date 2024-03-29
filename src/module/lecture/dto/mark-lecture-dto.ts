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

export class MarkLectureDto {
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  courseID: number;
}
