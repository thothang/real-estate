import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { AdminFeaturesController } from './admin-features.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [FeaturesController, AdminFeaturesController],
  providers: [FeaturesService, RolesGuard],
})
export class FeaturesModule {}
