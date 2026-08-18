import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
// import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { AdminUser } from './entities/admin-user.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class AdminUserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
}

@Controller('admin-user')
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly jwtService: JwtService,
  ) { }

  // Public routes
  @Post('register')
  register(@Body() body: CreateAdminUserDto) {
    return this.adminUsersService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminUsersService.login(body.email, body.password);
  }

  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }) {
    try {
      const decoded: any = this.jwtService.verify(body.token);
      const user = await this.adminUsersService.findOne(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }
      return { valid: true, user };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Protected routes
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions({ module: 'admin-users', action: 'view' })
  @Get()
  findAll(
    @Req() req,
    @Query() query: AdminUserQueryDto,
  ): Promise<PaginatedResult<AdminUser>> {
    return this.adminUsersService.findAll(req.user, query);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions({ module: 'admin-users', action: 'view' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.adminUsersService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions({ module: 'admin-users', action: 'add' })
  @Post()
  create(@Body() body: CreateAdminUserDto, @Req() req) {
    return this.adminUsersService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions({ module: 'admin-users', action: 'edit' })
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateAdminUserDto, @Req() req) {
    return this.adminUsersService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions({ module: 'admin-users', action: 'delete' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.adminUsersService.remove(id, req.user);
  }

  // Self-service routes (no permission check, just JWT)
  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  updateProfile(
    @Req() req,
    @Body() body: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'phone'>>,
  ) {
    const userId = req.user?.sub;
    return this.adminUsersService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/change-password')
  updatePassword(
    @Req() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.adminUsersService.updatePassword(
      req.user,
      body.oldPassword,
      body.newPassword,
    );
  }
}
