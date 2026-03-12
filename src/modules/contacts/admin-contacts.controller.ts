import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ContactsService } from './contacts.service';
import { GetAdminContactsQueryDto } from './dto/get-admin-contacts-query.dto';
import { UpdateContactRequestDto } from './dto/update-contact-request.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/contacts')
export class AdminContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async list(@Query() query: GetAdminContactsQueryDto) {
    return this.contactsService.listAdmin(query);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactRequestDto,
  ) {
    return this.contactsService.updateAdmin(id, dto);
  }
}

