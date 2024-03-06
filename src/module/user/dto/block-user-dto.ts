import {
  IsBoolean
} from 'class-validator';

export class BlockUserDto {
  @IsBoolean()
  isBlock: boolean;
}
