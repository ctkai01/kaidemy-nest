import { Transform } from 'class-transformer';
import {
  IsBoolean
} from 'class-validator';

export class BlockUserDto {
  @Transform(({ value }) => {
    return Boolean(+value);
  })
  isBlock?: boolean;
}
