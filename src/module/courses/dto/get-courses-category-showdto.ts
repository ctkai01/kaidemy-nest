import { RatingStats, CourseSort } from '../../../constants/course';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { FilterOrderCourse } from '../../../constants';

export class GetCoursesCategoryShow extends PageCommonOptionsDto {
  
}
