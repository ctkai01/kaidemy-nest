import { Transform } from 'class-transformer';
import {
  IsNumber, IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class RemoveLearningTopicLearningDto {
  @IsNumber()
  @Transform(({ value, key, obj, type }) => +value)
  learningID: number;

  @IsNumber()
  @Transform(({ value, key, obj, type }) => +value)
  topicLearningID: number;
}
