import { Module } from '@nestjs/common';
import { AuthService } from './user.service';
import { AuthController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Chat } from '../chat/entities/chat.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailService } from 'src/utils/email.service';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../utils/email.module';
import { BookingLog } from '../booking-log/entities/booking-log.entity';
import { ChatWithAgent } from '../chat-with-agent/entities/chat-with-agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AdminUser, Plan, Subscription, Chat, BookingLog, ChatWithAgent]),
    ConfigModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, UsersService, EmailService],
  controllers: [AuthController, UsersController],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
