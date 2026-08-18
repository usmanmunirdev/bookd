import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { PersonalPreferencesService } from './personal-preferences.service';
import { CreatePersonalPreferenceDto } from './dto/create-personal-preference.dto';
import { UpdatePersonalPreferenceDto } from './dto/update-personal-preference.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('personal-preferences')
export class PersonalPreferencesController {
  constructor(private readonly service: PersonalPreferencesService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  getPreferences(@Req() req: any) {
    console.log('Fetching preferences for user:', req.user);
    return this.service.getPreferences(req.user?.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createPreferences(@Req() req: any, @Body() dto: CreatePersonalPreferenceDto) {
    return this.service.createPreferences(req.user?.sub, dto);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updatePreferences(@Req() req: any, @Body() dto: UpdatePersonalPreferenceDto) {
    return this.service.updatePreferences(req.user?.sub, dto);
  }

  @Delete()
  deletePreferences(@Req() req: any) {
    return this.service.deletePreferences(req.user?.sub);
  }
}