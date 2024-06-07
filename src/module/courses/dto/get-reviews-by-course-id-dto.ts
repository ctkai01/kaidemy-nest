import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { FilterOrderCourse, StarCount } from '../../../constants';

export class GetReviewsDto extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsEnum(StarCount)
  starCount: StarCount;
}
