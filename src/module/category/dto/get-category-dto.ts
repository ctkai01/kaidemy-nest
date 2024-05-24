import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';

export class GetCategoryDto extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  parentID?: number;
}
