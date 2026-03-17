import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { AdminPropertiesController } from './admin-properties.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [PropertiesController, AdminPropertiesController],
  providers: [PropertiesService, RolesGuard],
})
export class PropertiesModule {}
