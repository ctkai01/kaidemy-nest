import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateQuestionLectureDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;
}
