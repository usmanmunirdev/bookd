import { Expose, Type } from 'class-transformer';

export class AdminUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;
}

export class ContactResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  subject: string;

  @Expose()
  message: string;

  @Expose()
  createdAt: Date;

  @Expose()
  replySubject?: string;

  @Expose()
  reply?: string;

  @Expose()
  repliedAt?: Date;

  @Expose()
  @Type(() => AdminUserResponseDto)
  repliedBy?: AdminUserResponseDto;
}
