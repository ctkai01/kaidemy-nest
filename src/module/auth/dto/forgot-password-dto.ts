import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @IsEmail()
  email: string;
}
