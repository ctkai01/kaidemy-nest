import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  isDecimal,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ApprovalCourseReviewDto {
  @Transform(({ value }) => {
    return Boolean(+value);
  })
  approval?: boolean;
}
