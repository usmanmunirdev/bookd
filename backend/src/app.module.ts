import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './user/user.module';
import { PlansModule } from './plans/plans.module';
import { ChatModule } from './chat/chat.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SpeechModule } from './speech/speech.module';
import { getOpenAIClient } from './utils/openai';
import { NotificationsModule } from './notifications/notifications.module';
import { PersonalPreferencesModule } from './personal-preferences/personal-preferences.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { BookingModule } from './booking-log/booking-log.module';
import { ChatWithAgentModule } from './chat-with-agent/chat-with-agent.module';
import { StripePaymentModule } from './stripe-payment/stripe-payment.module';
import { FaqModule } from './faqs/faq.module';
import { ContactModule } from './contact-us/contact.module';
import { PoliciesModule } from './policies/policies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      schema: 'bookd_schema',
      synchronize: true,
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    }),
    AuthModule,
    PlansModule,
    ChatModule,
    GoogleCalendarModule,
    SpeechModule,
    NotificationsModule,
    PersonalPreferencesModule,
    SubscriptionModule,
    AdminUsersModule,
    PermissionsModule,
    RolesModule,
    BookingModule,
    ChatWithAgentModule,
    StripePaymentModule,
    FaqModule,
    ContactModule,
    PoliciesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) { }

  onModuleInit() {
    getOpenAIClient(this.configService);
  }
}
