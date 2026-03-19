import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ListingStatus } from '@prisma/client';
import { UploadsService } from '../uploads/uploads.service';
import { propertyImagesMulterOptions } from '../../common/config/multer.config';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/properties')
export class AdminPropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Get()
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ListingStatus,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    return this.propertiesService.findAllAdmin(pageNum, limitNum, status);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.propertiesService.findOneAdminById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User) {
    return this.propertiesService.createPropertyAdmin(dto, user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.updatePropertyAdmin(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.propertiesService.deletePropertyAdmin(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10, propertyImagesMulterOptions))
  async uploadImages(
    @Param('id') propertyId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('primary_index') primaryIndex?: string,
  ) {
    const primary =
      primaryIndex != null ? parseInt(String(primaryIndex), 10) : 0;
    const saved = await this.uploadsService.savePropertyImages(
      files || [],
      propertyId,
      Number.isNaN(primary) ? 0 : primary,
    );
    const data = await this.propertiesService.addPropertyImages(
      propertyId,
      saved,
    );
    return {
      data,
      message: 'Tải ảnh lên thành công',
    };
  }
}
