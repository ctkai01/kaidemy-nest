import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AcceptNotificationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fcmToken: string;
}
