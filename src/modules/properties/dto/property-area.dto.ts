import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyAreaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  length?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  land_area?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usable_area?: number;
}
