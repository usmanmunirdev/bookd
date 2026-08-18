import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async create(createRoleDto: CreateRoleDto): Promise<{ message: string; role: Role }> {
        try {
            const existing = await this.roleRepository.findOne({ where: { name: createRoleDto.name } });
            if (existing) throw new ConflictException('Role name already exists');

            const role = this.roleRepository.create(createRoleDto);
            const savedRole = await this.roleRepository.save(role);
            return { message: 'Role created successfully', role: savedRole };
        } catch (error) {
            this.handleError(error);
        }
    }

    async findAll(search?: string): Promise<{ message: string; count: number; roles: Role[] }> {
        try {
            const where = search
                ? { name: ILike(`%${search}%`) } 
                : {};

            const roles = await this.roleRepository.find({ where, order: { createdAt: 'DESC' } });

            return {
                message: roles.length
                    ? 'Roles fetched successfully'
                    : search
                        ? `No roles found matching "${search}"`
                        : 'No roles found',
                count: roles.length,
                roles,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    async findOne(id: string): Promise<Role> {
        try {
            const role = await this.roleRepository.findOne({ where: { id } });
            if (!role) throw new NotFoundException('Role not found');
            return role;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<{ message: string; role: Role }> {
        try {
            const role = await this.findOne(id);
            Object.assign(role, updateRoleDto);
            const updated = await this.roleRepository.save(role);
            return { message: 'Role updated successfully', role: updated };
        } catch (error) {
            this.handleError(error);
        }
    }

    async remove(id: string): Promise<{ message: string }> {
        try {
            const role = await this.findOne(id);
            await this.roleRepository.remove(role);
            return { message: 'Role deleted successfully' };
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
        console.error('Unhandled RoleService Error:', error);
        throw new InternalServerErrorException('Something went wrong. Please try again later.');
    }
}
