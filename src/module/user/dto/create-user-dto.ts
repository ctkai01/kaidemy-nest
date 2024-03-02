import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  old_password: string;
  
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  new_password: string;
}
