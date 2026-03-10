import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyStructureDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floors?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  living_rooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  kitchens?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  mezzanine?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  balcony?: boolean;
}
