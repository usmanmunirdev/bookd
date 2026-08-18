import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { Plan } from './entities/plan.entity';
import { AdminUser } from '../admin-users/entities/admin-user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Plan, AdminUser])],
  providers: [PlansService],
  controllers: [PlansController],
})
export class PlansModule {}
