import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact-us.entity';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { EmailModule } from '../utils/email.module';
import { AdminUser } from '../admin-users/entities/admin-user.entity'; // <-- import entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, AdminUser]),
    EmailModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
