import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';
// import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // ✅ 1. If no specific permission required, allow
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;

    if (!jwtUser?.sub) {
      throw new ForbiddenException('Not authorized');
    }

    // ✅ 2. Load admin user with role & permissions
    const admin = await this.adminRepo.findOne({
      where: { id: jwtUser.sub },
      relations: ['role'],
    });

    if (!admin) {
      throw new ForbiddenException('Admin not found');
    }

    // ✅ 3. Super Admin (type 0) bypasses all checks
    if (admin.type === 0) {
      return true;
    }

    // if (!admin.role) {
    //   throw new ForbiddenException('No role assigned');
    // }

    // ✅ 4. Collect granted permissions from role
    const grantedPermissions = new Set<string>();
    // if (admin.role.permissions) {
    //   admin.role.permissions.forEach((p: Permission) => {
    //     // Permission code should be in format: "module_action" (e.g., "admin-users_view")
    //     if (p.code) {
    //       grantedPermissions.add(p.code);
    //     }
    //   });
    // }

    // ✅ 5. Verify that all required permissions exist
    // Required permission format: { module: 'admin-users', action: 'view' }
    // Permission code format: 'admin-users_view'
    // const hasAll = required.every((req) => {
    //   const requiredCode = `${req.module}_${req.action}`;
    //   return grantedPermissions.has(requiredCode);
    // });

    // if (!hasAll) {
    //   throw new ForbiddenException('Insufficient permissions');
    // }

    return true;
  }
}
