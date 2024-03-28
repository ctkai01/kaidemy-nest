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

export class UpdateLectureDto {
  @IsOptional()
  @MinLength(1)
  @MaxLength(2000)
  description: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsEnum(UploadType)
  typeUpdate: UploadType;

  @Transform(({ value, key, obj, type }) => +value)
  @IsEnum(AssetType)
  assetType: AssetType;

  @IsOptional()
  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  assetID: number;

  @IsOptional()
  @IsBoolean()
  isPromotional: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  article: string;
}
// asset;