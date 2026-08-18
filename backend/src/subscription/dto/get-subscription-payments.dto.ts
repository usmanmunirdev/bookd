import {
    IsOptional,
    IsUUID,
    IsInt,
    IsString,
    Min,
    Max,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetSubscriptionPaymentsDto {
    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}
