import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { FilterOrderCourse } from '../../../constants';

export class GetCourseDto extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsEnum(FilterOrderCourse)
  filterOrder: FilterOrderCourse;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  userID: number;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  subCategoryID: number;
}
