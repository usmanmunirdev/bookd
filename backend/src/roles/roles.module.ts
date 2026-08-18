import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { AdminUser } from '../admin-users/entities/admin-user.entity'; 
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, AdminUser]), // 👈 ensure AdminUser is here
  ],
  controllers: [RolesController],
  providers: [RolesService, PermissionsGuard],
  exports: [RolesService],
})
export class RolesModule {}
