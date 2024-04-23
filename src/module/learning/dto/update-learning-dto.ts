import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
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
  @Transform(({ value, key, obj, type }) => +value)
  @IsIn([CourseUtil.ARCHIE, CourseUtil.STANDARD_TYPE])
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
