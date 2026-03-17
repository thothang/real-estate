import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ContactStatus } from '@prisma/client';

export class GetAdminContactsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}
