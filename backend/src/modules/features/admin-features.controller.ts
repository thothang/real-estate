import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FeaturesService } from './features.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/features')
export class AdminFeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  async list() {
    const data = await this.featuresService.findAll();
    return {
      data,
      message: 'Lấy danh sách tiện ích thành công',
    };
  }
}
