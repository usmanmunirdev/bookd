// src/policies/dto/create-policy.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

