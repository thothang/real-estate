import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { AdminContactsController } from './admin-contacts.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [ContactsController, AdminContactsController],
  providers: [ContactsService, RolesGuard],
})
export class ContactsModule {}
