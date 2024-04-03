import {
  IsBoolean, IsString, MaxLength, MinLength
} from 'class-validator';

export class VerifyTeacherDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  key: string;
}
