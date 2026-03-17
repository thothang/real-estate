import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';
import type { GetAdminContactsQueryDto } from './dto/get-admin-contacts-query.dto';
import type { UpdateContactRequestDto } from './dto/update-contact-request.dto';

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

  async listAdmin(query: GetAdminContactsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status != null) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.contactRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.contactRequest.count({ where }),
    ]);

    const data = items.map((r) => ({
      id: r.id,
      customer_name: r.customerName,
      customer_phone: r.customerPhone,
      customer_email: r.customerEmail,
      message: r.message,
      status: r.status,
      property: r.property,
      created_at: r.createdAt,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total_items: total,
        total_pages: Math.ceil(total / limit) || 1,
      },
      message: 'Lấy danh sách yêu cầu thành công',
    };
  }

  async updateAdmin(id: string, dto: UpdateContactRequestDto) {
    const existing = await this.prisma.contactRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HttpException(
        {
          code: 'CONTACT_NOT_FOUND',
          message: 'Không tìm thấy yêu cầu liên hệ này',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const dataToUpdate: any = {};
    if (dto.status != null) dataToUpdate.status = dto.status;
    if (dto.notes != null) dataToUpdate.notes = dto.notes;

    const updated = await this.prisma.contactRequest.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, status: true, notes: true },
    });

    return {
      data: updated,
      message: 'Cập nhật yêu cầu thành công',
    };
  }
}
