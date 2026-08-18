import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { TermsConditions } from './entities/terms-conditions.entity';
import { PrivacyPolicy } from './entities/privacy-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TermsConditions, PrivacyPolicy])],
  providers: [PoliciesService],
  controllers: [PoliciesController],
})
export class PoliciesModule {}
