import { RatingStats, CourseSort, Reply } from '../../../constants/course';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { FilterOrderCourse } from '../../../constants';

export class GetUsersAuthor extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value }) => +value)
  courseID?: number;
}
