import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/properties')
export class AdminPropertiesController {
  @Get()
  async list() {
    // Placeholder; will be implemented to match admin properties listing API
    return { message: 'Admin properties endpoint' };
  }
}

