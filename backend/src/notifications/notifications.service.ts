import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferences } from './entities/notification.entity';
import { UpdatePreferencesDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreferences)
    private readonly repo: Repository<NotificationPreferences>,
  ) {}

  async getPreferences(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async createPreferences(userId: string) {
    const prefs = this.repo.create({
      user: { id: userId } as any,
      bookingUpdates: true,
      reminders: true,
      promotions: true,
      vipAlerts: true,
      discreetPush: 'medium',
    });
    return this.repo.save(prefs);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    let prefs = await this.getPreferences(userId);
    if (!prefs) {
      prefs = await this.createPreferences(userId);
    }
    Object.assign(prefs, dto);
    return this.repo.save(prefs);
  }

  async deletePreferences(userId: string) {
    const prefs = await this.getPreferences(userId);
    if (prefs) {
      return this.repo.remove(prefs);
    }
    return null;
  }
}
