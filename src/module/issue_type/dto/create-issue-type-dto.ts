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

export class CreateIssueTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

}
