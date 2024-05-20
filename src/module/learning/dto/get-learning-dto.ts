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
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { CourseUtil } from 'src/constants';

export class GetLearningDto extends PageCommonOptionsDto {
  @IsOptional()
   @Transform(({ value }) => value.split(',').map(Number))
  @IsEnum(CourseUtil, { each: true })
  types: CourseUtil[];
}
