import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const features = await this.prisma.feature.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
    return features;
  }
}
