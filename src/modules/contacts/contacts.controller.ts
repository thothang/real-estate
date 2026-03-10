import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactRequestDto) {
    return this.contactsService.createContactRequest(dto);
  }
}
