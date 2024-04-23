import { Transform } from 'class-transformer';
import {
  IsNumber, IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateLearningTopicLearningDto {
  @IsNumber()
  @Transform(({ value, key, obj, type }) => +value)
  learningID: number;

  @IsNumber()
  @Transform(({ value, key, obj, type }) => +value)
  topicLearningID: number;
}
