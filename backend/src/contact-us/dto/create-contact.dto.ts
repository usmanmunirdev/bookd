import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @Transform(({ value }) => value.trim())
  fullName: string;

  @IsEmail()
  @MaxLength(150)
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @Transform(({ value }) => value.trim())
  subject: string;

  @IsString()
  @MinLength(10)
  @MaxLength(3000)
  @Transform(({ value }) => value.trim())
  message: string;
}
