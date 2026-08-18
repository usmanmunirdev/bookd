import { Body, Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';
import { NotificationPreferencesService } from './notifications.service';
import { UpdatePreferencesDto } from './dto/update-notification.dto';


@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly service: NotificationPreferencesService) {}

  @Get()
  async getPreferences(@Req() req: any) {
    return this.service.getPreferences(req.user.id);
  }

  @Post()
  async createPreferences(@Req() req: any) {
    return this.service.createPreferences(req.user.id);
  }

  @Put()
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.service.updatePreferences(req.user.id, dto);
  }

  @Delete()
  async deletePreferences(@Req() req: any) {
    return this.service.deletePreferences(req.user.id);
  }
}
