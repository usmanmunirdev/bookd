import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @RequirePermissions({ module: 'users', action: 'view' })
  @Get()
  list(@Query('page') page?: number, @Query('name') name?: string) {
    return this.usersService.list({ page: Number(page) || 1, name });
  }

  @Get("stats")
  stats(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.usersService.getDashboardStats(startDate, endDate);
  }

  @RequirePermissions({ module: 'users', action: 'view' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @RequirePermissions({ module: 'users', action: 'add' })
  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @RequirePermissions({ module: 'users', action: 'edit' })
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @RequirePermissions({ module: 'users', action: 'delete' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
