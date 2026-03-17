import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateContactRequestDto {
  @IsUUID()
  property_id: string;

  @IsString()
  @MinLength(1, { message: 'Tên khách hàng là trường bắt buộc' })
  customer_name: string;

  @IsString()
  @MinLength(1, { message: 'Số điện thoại là trường bắt buộc' })
  customer_phone: string;

  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
