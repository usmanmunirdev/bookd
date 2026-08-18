import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class MarkReadDto {
  chatId: string;
  readerType: 'USER' | 'ADMIN';
}