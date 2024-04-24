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

export class CreateReportDto {
  @IsNumber()
  @Transform(({ value }) => +value)
  courseID: number;

  @IsNumber()
  @Transform(({ value }) => +value)
  issueTypeID: number;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description: string;
}
