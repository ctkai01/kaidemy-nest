import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Order } from 'src/constants';

export class PageCommonOptionsDto {
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  @IsOptional()
  readonly size?: number = 10;

  @Type(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  readonly search?: string;

  get skip(): number {
    return (this.page - 1) * this.size;
  }
}
