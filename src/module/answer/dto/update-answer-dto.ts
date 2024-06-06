import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAnswerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  answerText: string;

  @Transform(({ value, key, obj, type }) => +value)
  @IsNumber()
  questionID: number;

  @Transform(({ value }) => {
    return Boolean(+value);
  })
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  explain: string;
}
