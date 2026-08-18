import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { GoogleCalendarController } from './google-calendar.controller';
import { AuthModule } from '../user/user.module';
import { AuthMiddleware } from '../utils/middleware';

import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarToken } from './entities/google-calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleCalendarToken, User]), AuthModule],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'api/google/callback', method: RequestMethod.GET })
      .forRoutes(GoogleCalendarController);
  }
}
