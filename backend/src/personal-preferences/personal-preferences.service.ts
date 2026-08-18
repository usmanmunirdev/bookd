import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalPreference } from './entities/personal-preference.entity';
import { CreatePersonalPreferenceDto } from './dto/create-personal-preference.dto';
import { UpdatePersonalPreferenceDto } from './dto/update-personal-preference.dto';

@Injectable()
export class PersonalPreferencesService {
  constructor(
    @InjectRepository(PersonalPreference)
    private readonly repo: Repository<PersonalPreference>,
  ) { }

  // 🔹 Basic array validation helper
  private validateArray(value?: string[], fieldName?: string) {
    if (value === undefined) return;

    if (!Array.isArray(value)) {
      throw new BadRequestException(`${fieldName} must be an array`);
    }

    if (value.some((v) => typeof v !== 'string' || !v.trim())) {
      throw new BadRequestException(
        `${fieldName} must contain non-empty strings`,
      );
    }
  }

  // 🔹 Get preferences
  async getPreferences(userId: string): Promise<PersonalPreference | null> {
    try {
      return await this.repo.findOne({
        where: { user: { id: userId } },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch preferences',
      );
    }
  }

  // 🔹 Create preferences (ONE per user)
  async createPreferences(
    userId: string,
    dto: CreatePersonalPreferenceDto,
  ): Promise<PersonalPreference> {
    try {
      const existing = await this.getPreferences(userId);
      if (existing) {
        throw new BadRequestException('Preferences already exist');
      }

      // Basic validation
      this.validateArray(dto.preferredCities, 'preferredCities');
      this.validateArray(dto.favoriteCuisines, 'favoriteCuisines');
      this.validateArray(dto.diningStyle, 'diningStyle');
      this.validateArray(dto.preferredSeatings, 'preferredSeatings');

      const prefs = this.repo.create({
        user: { id: userId } as any,
        preferredCities: dto.preferredCities ?? [],
        favoriteCuisines: dto.favoriteCuisines ?? [],
        diningStyle: dto.diningStyle ?? [],
        preferredSeatings: dto.preferredSeatings ?? [],
      });

      return await this.repo.save(prefs);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to create preferences',
      );
    }
  }

  // 🔹 Update preferences (SAFE partial update)
  async updatePreferences(
    userId: string,
    dto: UpdatePersonalPreferenceDto,
  ): Promise<PersonalPreference> {
    try {
      console.log('Existing prefs:', userId);
      console.log('Update DTO:', dto);
      // Basic validation (only if provided)
      this.validateArray(dto.preferredCities, 'preferredCities');
      this.validateArray(dto.favoriteCuisines, 'favoriteCuisines');
      this.validateArray(dto.diningStyle, 'diningStyle');
      this.validateArray(dto.preferredSeatings, 'preferredSeatings');

      let prefs = await this.getPreferences(userId);
      // 🔹 If no preferences exist → CREATE
      if (!prefs) {
        prefs = this.repo.create({
          user: { id: userId } as any,
          preferredCities: dto.preferredCities ?? [],
          favoriteCuisines: dto.favoriteCuisines ?? [],
          diningStyle: dto.diningStyle ?? [],
          preferredSeatings: dto.preferredSeatings ?? [],
        });

        return await this.repo.save(prefs);
      }

      // 🔹 Otherwise → UPDATE existing
      prefs.preferredCities =
        dto.preferredCities ?? prefs.preferredCities;
      prefs.favoriteCuisines =
        dto.favoriteCuisines ?? prefs.favoriteCuisines;
      prefs.diningStyle =
        dto.diningStyle ?? prefs.diningStyle;
      prefs.preferredSeatings =
        dto.preferredSeatings ?? prefs.preferredSeatings;

      return await this.repo.save(prefs);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update preferences',
      );
    }
  }

  // 🔹 Delete preferences
  async deletePreferences(userId: string): Promise<void> {
    try {
      const prefs = await this.getPreferences(userId);

      if (!prefs) {
        throw new NotFoundException('Preferences not found');
      }

      await this.repo.remove(prefs);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Failed to delete preferences',
      );
    }
  }
}
