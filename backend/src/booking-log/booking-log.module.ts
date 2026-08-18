import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingLog } from './entities/booking-log.entity';
import { HotelBooking } from './entities/hotel-booking.entity';
import { FlightBooking } from './entities/flight-booking.entity';
import { EmailModule } from '../utils/email.module';
import { SmsModule } from '../utils/sms.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { BookingService } from './booking-log.service';
import { BookingController } from './booking-log.controller';
import { AuthModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingLog,
      HotelBooking,
      FlightBooking,
      User,
    ]),
    AuthModule,
    EmailModule,
    SmsModule,
    GoogleCalendarModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule { }
