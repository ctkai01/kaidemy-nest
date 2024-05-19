import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';

export class GetCoursesOverviewAuthorDto extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  courseID?: number;
}
