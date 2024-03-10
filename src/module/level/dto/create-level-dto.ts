import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLevelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;
}
