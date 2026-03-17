import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PropertyType,
  ListingType,
  LegalStatus,
  Direction,
  ListingStatus,
} from '@prisma/client';
import { PropertyAddressDto } from './property-address.dto';
import { PropertyStructureDto } from './property-structure.dto';
import { PropertyAreaDto } from './property-area.dto';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  property_type?: PropertyType;

  @IsOptional()
  @IsEnum(ListingType)
  listing_type?: ListingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsEnum(Direction)
  direction?: Direction;

  @IsOptional()
  @IsEnum(LegalStatus)
  legal_status?: LegalStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyAddressDto)
  address?: PropertyAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyStructureDto)
  structure?: PropertyStructureDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyAreaDto)
  area?: PropertyAreaDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  feature_ids?: string[];
}
