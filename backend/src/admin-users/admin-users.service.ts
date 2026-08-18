import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly configService: ConfigService,
  ) { }

  async register(data: CreateAdminUserDto): Promise<AdminUser> {
    const existing = await this.adminUserRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Admin user with this email already exists');
    }

    // let role: Role | null = null;
    // if (data.roleId) {
    //   role = await this.roleRepo.findOne({ where: { id: data.roleId } });
    //   if (!role) {
    //     throw new NotFoundException(`Role with id ${data.roleId} not found`);
    //   }
    // }

    const hashed = await bcrypt.hash(data.password, 10);

    const newAdmin = this.adminUserRepo.create({
      email: data.email,
      password: hashed,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      type: data.type ?? 1, // Default to role-based admin
      // role: role || undefined,
    });

    return await this.adminUserRepo.save(newAdmin);
  }

  async login(email: string, password: string) {
    try {
      const admin = await this.adminUserRepo.findOne({
        where: { email },
        relations: ['role'],
      });

      if (!admin) {
        throw new InternalServerErrorException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        throw new InternalServerErrorException('Invalid credentials');
      }

      const payload = {
        sub: admin.id,
        email: admin.email,
        type: admin.type,
      };

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new InternalServerErrorException('JWT_SECRET missing');
      }

      const token = jwt.sign(payload, secret, { expiresIn: '7d' });

      return { token, admin };
    } catch (error) {
      console.error('Login error:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async create(data: CreateAdminUserDto, reqUser: AdminUser): Promise<AdminUser> {

    const existing = await this.adminUserRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Admin user with this email already exists');
    }

    let role: Role | null = null;
    if (data.roleId) {
      role = await this.roleRepo.findOne({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundException(`Role with id ${data.roleId} not found`);
      }
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const newAdmin = this.adminUserRepo.create({
      email: data.email,
      password: hashed,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      type: data.type ?? 1,
      role: role || undefined,
    });

    const saved = await this.adminUserRepo.save(newAdmin);
    return await this.findOne(saved.id, reqUser);
  }

  async findAll(
    reqUser: AdminUser,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: string;
    },
  ): Promise<{
    data: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const qb = this.adminUserRepo
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.role', 'role')
      .select([
        'admin.id',
        'admin.firstName',
        'admin.lastName',
        'admin.email',
        'admin.phone',
        'admin.type',
        'admin.createdAt',
        'admin.updatedAt',
        'role.id',
        'role.name',
      ])
      .orderBy('admin.createdAt', 'DESC');

    console.log('reqUser', reqUser);
    // ❌ Exclude current logged-in user
    if (reqUser?.email) {
      qb.andWhere('admin.email != :currentUserEmail', { currentUserEmail: reqUser.email });
    }

    qb.andWhere('admin.type != :excludedType', { excludedType: 0 });

    // 🔍 Search by name or email
    if (query.search) {
      qb.andWhere(
        `(LOWER(admin.firstName) LIKE LOWER(:search)
        OR LOWER(admin.lastName) LIKE LOWER(:search)
        OR LOWER(admin.email) LIKE LOWER(:search))`,
        { search: `%${query.search}%` },
      );
    }

    // 🎯 Filter by roleId
    if (query.roleId) {
      qb.andWhere('role.id = :roleId', { roleId: query.roleId });
    }

    // 📄 Pagination
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        showing: data.length,
        currentPage: page, // add this so frontend still works
      } as any
    };
  }

  async findOne(id: string, reqUser?: AdminUser): Promise<AdminUser> {
    const user = await this.adminUserRepo.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`AdminUser #${id} not found`);
    }
    return user
    // return this.formatAdminUserForResponse(user);
  }

  // private formatAdminUserForResponse(admin: AdminUser): AdminUser {
  //   // Transform permissions to frontend format
  //   // Permission code format: "module_action" (e.g., "admin-users_view", "roles_add")
  //   if (admin.role && admin.role.permissions) {
  //     const permissionsMap: Record<string, any> = {};

  //     admin.role.permissions.forEach((perm) => {
  //       // Parse code: "module_action"
  //       const codeParts = perm.code.split('_');
  //       if (codeParts.length >= 2) {
  //         const action = codeParts.pop(); // Last part is action
  //         const module = codeParts.join('_'); // Everything else is module

  //         if (!permissionsMap[module]) {
  //           permissionsMap[module] = {
  //             view: false,
  //             add: false,
  //             edit: false,
  //             delete: false,
  //           };
  //         }

  //         if (action === 'view') permissionsMap[module].view = true;
  //         if (action === 'add') permissionsMap[module].add = true;
  //         if (action === 'edit') permissionsMap[module].edit = true;
  //         if (action === 'delete') permissionsMap[module].delete = true;
  //       }
  //     });

  //     (admin as any).role.permissions = permissionsMap;
  //   }

  //   return admin;
  // }

  async update(
    id: string,
    data: UpdateAdminUserDto,
    reqUser: AdminUser,
  ): Promise<AdminUser> {
    // 🚫 Prevent changing your own type
    if (id === reqUser.id && data.type !== undefined) {
      throw new UnauthorizedException('You cannot change your own type');
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`AdminUser #${id} not found`);
    }

    // 🚫 Prevent updating a Super Admin user (type = 0)
    if (user.type === 0) {
      throw new UnauthorizedException('You cannot update a Super Admin user');
    }

    let role: Role | null = null;
    if (data.roleId !== undefined) {
      if (data.roleId) {
        role = await this.roleRepo.findOne({ where: { id: data.roleId } });
        if (!role) {
          throw new NotFoundException(`Role with id ${data.roleId} not found`);
        }
      } else {
        role = null;
      }
    }

    const updateData: any = { ...data };
    delete updateData.roleId;

    if (role !== undefined) {
      updateData.role = role;
    }

    await this.adminUserRepo.update(id, updateData);
    return await this.findOne(id, reqUser);
  }

  async remove(id: string, reqUser: AdminUser): Promise<{ message: string }> {
    // 🚫 Prevent deleting yourself
    if (id === reqUser.id) {
      throw new UnauthorizedException('You cannot delete your own account');
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`AdminUser #${id} not found`);
    }

    // 🚫 Prevent deleting Super Admin
    if (user.type === 0) {
      throw new UnauthorizedException('Cannot delete a Super Admin user');
    }

    await this.adminUserRepo.delete(id);
    return { message: 'Admin user deleted successfully' };
  }

  async updateProfile(
    reqUserId: string,
    data: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'phone'>>,
  ): Promise<AdminUser> {
    // Guard against a missing id before anything else
    if (!reqUserId) {
      throw new BadRequestException('Authenticated user is missing an ID');
    }

    if ((data as any).email) {
      throw new UnauthorizedException('Email cannot be updated');
    }

    // Remove keys that are undefined to avoid empty update
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    try {
      await this.adminUserRepo.update(reqUserId, updateData);
      const user: any = await this.adminUserRepo.findOne({
        where: { id: reqUserId },
      });
      return user;
    } catch (error) {
      console.error('Error updating admin user profile:', error);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async updatePassword(
    reqUser: any,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Old and new password are required');
    }

    if (oldPassword == newPassword) {
      throw new BadRequestException('Old and new password cannot be the same');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    const userId = reqUser.sub ?? reqUser.id;
    const user = await this.adminUserRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.adminUserRepo.update(user.id, { password: hashed });

    return { message: 'Password updated successfully' };
  }
}
