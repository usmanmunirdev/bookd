import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Create a new permission record.
   */
  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const { name } = createPermissionDto;

      // Check for duplicate permission name
      const existing = await this.permissionRepository.findOne({ where: { name } });
      if (existing) {
        throw new ConflictException(`Permission with name "${name}" already exists.`);
      }

      const permission = this.permissionRepository.create(createPermissionDto);
      const saved = await this.permissionRepository.save(permission);

      return {
        success: true,
        message: 'Permission created successfully.',
        data: saved,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all permissions.
   */
  async findAll() {
    try {
      const permissions = await this.permissionRepository.find();
      return {
        success: true,
        message: 'Permissions fetched successfully.',
        data: permissions,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a single permission by ID.
   */
  async findOne(id: string) {
    try {
      const permission = await this.permissionRepository.findOne({ where: { id } });
      if (!permission) throw new NotFoundException('Permission not found');

      return {
        success: true,
        message: 'Permission fetched successfully.',
        data: permission,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update an existing permission by ID.
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    try {
      const permission = await this.permissionRepository.findOne({ where: { id } });
      if (!permission) throw new NotFoundException('Permission not found');

      if (updatePermissionDto.name && !updatePermissionDto.name.trim()) {
        throw new BadRequestException('Permission name cannot be empty.');
      }

      Object.assign(permission, updatePermissionDto);
      const updated = await this.permissionRepository.save(permission);

      return {
        success: true,
        message: 'Permission updated successfully.',
        data: updated,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete a permission by ID.
   */
  async remove(id: string) {
    try {
      const permission = await this.permissionRepository.findOne({ where: { id } });
      if (!permission) throw new NotFoundException('Permission not found');

      await this.permissionRepository.remove(permission);

      return {
        success: true,
        message: 'Permission deleted successfully.',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Common error handler for consistent exception messages.
   */
  private handleError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    console.error('Unhandled Error in PermissionsService:', error);
    throw new InternalServerErrorException('An unexpected error occurred. Please try again later.');
  }
}
