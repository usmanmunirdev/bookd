import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  actions: Record<string, boolean>;
}
