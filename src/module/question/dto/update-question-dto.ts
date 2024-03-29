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

export class UpdateQuestionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}
