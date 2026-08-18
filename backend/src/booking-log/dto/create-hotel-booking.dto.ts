import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHotelBookingDto {
  @IsString()
  userId: string;

  @IsString()
  rateKey: string;

  // ── Hotel identity ────────────────────────────────────────────
  @IsOptional() @IsString()
  hotelId?: string;

  @IsOptional() @IsString()
  hotelName?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  categoryName?: string;

  @IsOptional() @IsNumber()
  rating?: number;

  @IsOptional() @IsString()
  destinationName?: string;

  @IsOptional() @IsString()
  destinationCode?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  postalCode?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  countryCode?: string;

  @IsOptional() @IsNumber()
  latitude?: number;

  @IsOptional() @IsNumber()
  longitude?: number;

  @IsOptional() @IsString()
  chainName?: string;

  @IsOptional() @IsString()
  hotelPhone?: string;

  @IsOptional() @IsString()
  hotelEmail?: string;

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  images?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  amenities?: string[];

  // ── Room / board details ──────────────────────────────────────
  @IsOptional() @IsString()
  boardName?: string;

  @IsOptional() @IsString()
  boardCode?: string;

  // ── Stay ─────────────────────────────────────────────────────
  @IsNumber() @Min(1) @Max(9)
  adults: number;

  @IsNumber() @Min(0)
  children: number;

  @IsOptional() @IsArray() @ArrayMaxSize(8)
  @IsNumber({}, { each: true })
  childrenAges?: number[];

  @IsOptional() @IsNumber() @Min(1)
  rooms?: number;

  // ── Holder (primary guest) ────────────────────────────────────
  @IsString()
  holderName: string;

  @IsString()
  holderSurname: string;

  @IsEmail()
  holderEmail: string;

  @IsOptional() @IsString()
  holderPhone?: string;

  // ── Misc ──────────────────────────────────────────────────────
  @IsOptional() @IsString()
  remark?: string;

  @IsOptional() @IsString()
  paymentMethodId?: string;
}