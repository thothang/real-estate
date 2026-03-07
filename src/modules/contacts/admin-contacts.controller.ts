import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/contacts')
export class AdminContactsController {
  @Get()
  async list() {
    // Placeholder; will be implemented to match admin contacts listing API
    return { message: 'Admin contacts endpoint' };
  }
}

