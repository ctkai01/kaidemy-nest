import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginGoogleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  token: string;
}
