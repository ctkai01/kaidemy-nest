import { RatingStats, CourseSort } from './../../../constants/course';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { FilterOrderCourse } from '../../../constants';

export class GetCoursesCategory extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  rating: number;

  @IsOptional()
  @Transform(({ value }) => value.split(','))
  durations: string[];

  @IsOptional()
  @Transform(({ value }) => value.split(',').map(Number))
  levels: number[];

  @IsOptional()
  @IsEnum(CourseSort)
  sortCourse: CourseSort;
}
