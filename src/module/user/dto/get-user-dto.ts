import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';

export class GetUserDto extends PageCommonOptionsDto {
  @IsOptional()
  @Transform(({ value }) => {
    return Boolean(+value);
  })
  isBlock?: boolean;

  @IsOptional()
  @Transform(({ value }) => value.split(','))
  roles: string[];
}
