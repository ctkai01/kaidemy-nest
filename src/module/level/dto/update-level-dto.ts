import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateLevelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;
}
