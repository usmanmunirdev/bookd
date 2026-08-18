import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsNumber()
  type?: number; // 0 = Super Admin, 1 = Role-based Admin

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}
