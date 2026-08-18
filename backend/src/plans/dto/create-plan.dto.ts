import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  aiQueryLimit?: number;

  @IsOptional() @IsBoolean() aiPoweredSearch?: boolean;
  @IsOptional() @IsBoolean() conciergeAccess?: boolean;
  @IsOptional() @IsBoolean() flightBooking?: boolean;
  @IsOptional() @IsBoolean() hotelBooking?: boolean;
  @IsOptional() @IsBoolean() restaurantBooking?: boolean;

  @IsOptional() @IsBoolean() calendarReminder?: boolean;
  @IsOptional() @IsBoolean() emailReminder?: boolean;
  @IsOptional() @IsBoolean() smsReminder?: boolean;

  @IsOptional() @IsBoolean() bookingHistory?: boolean;
  @IsOptional() @IsBoolean() smartRecommendations?: boolean;
  @IsOptional() @IsBoolean() earlyFeatureAccess?: boolean;
  @IsOptional() @IsBoolean() prioritySupport?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
