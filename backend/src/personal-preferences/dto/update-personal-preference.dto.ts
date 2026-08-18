
import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonalPreferenceDto } from './create-personal-preference.dto';


export class UpdatePersonalPreferenceDto extends PartialType(
  CreatePersonalPreferenceDto,
) {}
