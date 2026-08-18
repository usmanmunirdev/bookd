import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { DiscreetLevel } from '../entities/notification.entity';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  bookingUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @IsOptional()
  @IsBoolean()
  promotions?: boolean;

  @IsOptional()
  @IsBoolean()
  vipAlerts?: boolean;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  discreetPush?: DiscreetLevel;
}
