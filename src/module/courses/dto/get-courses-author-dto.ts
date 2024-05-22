import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';

export class GetCoursesAuthorDto extends PageCommonOptionsDto {
  // @IsOptional()
  // @Transform(({ value, key, obj, type }) => +value)
  // userID?: number;
}
