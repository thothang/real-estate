import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactStatus } from '@prisma/client';

export class UpdateContactRequestDto {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
