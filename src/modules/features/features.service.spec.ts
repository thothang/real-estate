import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesService } from './features.service';
import { PrismaService } from '../../database/prisma.service';

describe('FeaturesService', () => {
  let service: FeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeaturesService, PrismaService],
    }).compile();

    service = module.get<FeaturesService>(FeaturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
