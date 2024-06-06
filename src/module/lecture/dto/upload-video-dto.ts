import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AssetType, UploadType } from 'src/constants';

export class UploadVideoDto {
  @IsOptional()
  @Transform(({ value }) => {
    return Boolean(+value);
  })
  isReplace: boolean;
}
// asset;
