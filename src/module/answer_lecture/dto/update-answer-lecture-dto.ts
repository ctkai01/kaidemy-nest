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

export class UpdateAnswerLectureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  answer: string;
}
