import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async createContactRequest(dto: CreateContactRequestDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.property_id },
    });

    if (!property) {
      throw new HttpException(
        {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Không tìm thấy bất động sản',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.contactRequest.create({
      data: {
        propertyId: dto.property_id,
        customerName: dto.customer_name,
        customerPhone: dto.customer_phone,
        customerEmail: dto.customer_email,
        message: dto.message,
      },
    });

    return {
      data: {},
      message:
        'Gửi yêu cầu liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất.',
    };
  }
}
