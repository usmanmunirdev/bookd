import { IsArray, IsNotEmpty, IsString, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class PermissionActionDto {
  @IsBoolean()
  add: boolean;

  @IsBoolean()
  view: boolean;

  @IsBoolean()
  update: boolean;

  @IsBoolean()
  delete: boolean;
}

class RolePermissionDto {
  @IsString()
  permissionId: string;

  @ValidateNested()
  @Type(() => PermissionActionDto)
  actions: PermissionActionDto;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  permissions: RolePermissionDto[];
}
