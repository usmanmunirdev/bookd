import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { User } from 'src/user/entities/user.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { AuthMiddleware } from 'src/utils/middleware';
import { AuthModule } from 'src/user/user.module';
import { SubscriptionPayment } from './entities/subscription-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, User, Plan, SubscriptionPayment]), AuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'subscription/webhook', method: RequestMethod.ALL })
      .forRoutes(SubscriptionController);
  }
}
