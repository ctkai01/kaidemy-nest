import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  headline: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  biography: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  twitterURL: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkedInURL: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  youtubeURL: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  websiteURL: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  facebookURL: string;
}
