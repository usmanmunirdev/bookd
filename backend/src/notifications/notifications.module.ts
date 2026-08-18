import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationPreferences } from './entities/notification.entity';
import { NotificationPreferencesController } from './notifications.controller';
import { NotificationPreferencesService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreferences])],
  controllers: [NotificationPreferencesController],
  providers: [NotificationPreferencesService],
  exports: [NotificationPreferencesService], 
})
export class NotificationsModule {}
