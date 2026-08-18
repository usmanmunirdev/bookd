
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PersonalPreferencesService } from './personal-preferences.service';
import { PersonalPreferencesController } from './personal-preferences.controller';
import { User } from 'src/user/entities/user.entity';
import { PersonalPreference } from './entities/personal-preference.entity';


@Module({
  imports: [TypeOrmModule.forFeature([PersonalPreference, User]),
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '7d' },
  }),],
  providers: [PersonalPreferencesService],
  controllers: [PersonalPreferencesController],
})
export class PersonalPreferencesModule { }
