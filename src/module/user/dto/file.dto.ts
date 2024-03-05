// file.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class FileDto {
  @IsNotEmpty()
  @IsString()
  mimetype: string;

  @IsNotEmpty()
  @IsString()
  originalname: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsString()
  size: string;
}
