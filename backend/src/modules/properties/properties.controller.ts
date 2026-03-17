import { Controller, Get, Param, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { GetPropertiesQueryDto } from './dto/get-properties-query.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  async list(@Query() query: GetPropertiesQueryDto) {
    return this.propertiesService.findAllPublic(query);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.propertiesService.findOneBySlugPublic(slug);
  }
}
