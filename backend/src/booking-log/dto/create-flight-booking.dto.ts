import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  IsEmail,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TravelerDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(['ADULT', 'CHILD', 'INFANT'])
  type: 'ADULT' | 'CHILD' | 'INFANT';

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @IsDateString()
  passportExpiry: string;

  @IsString()
  @IsOptional()
  passportIssuingCountry?: string;
}

export class SeatPreferenceDto {
  @IsString()
  travelerId: string;

  @IsString()
  @IsOptional()
  segmentId?: string;

  @IsEnum(['WINDOW', 'AISLE', 'MIDDLE', 'NO_PREFERENCE'])
  @IsOptional()
  seatType?: 'WINDOW' | 'AISLE' | 'MIDDLE' | 'NO_PREFERENCE';
}

export class CreateFlightBookingDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  // Full Amadeus flight offer object from the search result
  @IsNotEmpty()
  flightOffer: Record<string, any>;

  // Contact
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  // Travelers
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravelerDto)
  travelers: TravelerDto[];

  // Seat preferences (optional)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SeatPreferenceDto)
  seatPreferences?: SeatPreferenceDto[];

  @IsString()
  @IsOptional()
  specialRequests?: string;

  // Stripe payment method (optional if already saved on user)
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}