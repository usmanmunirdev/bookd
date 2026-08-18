import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminUserDto } from './create-admin-user.dto';

export class UpdateAdminUserDto extends PartialType(CreateAdminUserDto) {
  // Exclude password from update (use separate endpoint)
  password?: never;
}
