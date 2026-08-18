import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    UsePipes,
    ValidationPipe,
    Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { plainToInstance } from 'class-transformer';
import { AdminUser } from '../admin-users/entities/admin-user.entity';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() dto: CreateContactDto): Promise<ContactResponseDto> {
        const contact = await this.contactService.create(dto);
        return plainToInstance(ContactResponseDto, contact, { excludeExtraneousValues: true });
    }

    @Get()
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search?: string,
    ) {
        const result = await this.contactService.findAll(page, limit, search);

        return {
            data: plainToInstance(ContactResponseDto, result.data, { excludeExtraneousValues: true }),
            pagination: result.pagination,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ContactResponseDto> {
        const contact = await this.contactService.findOne(id);
        return plainToInstance(ContactResponseDto, contact, { excludeExtraneousValues: true });
    }

    @Put(':id/reply')
    async reply(
        @Param('id') id: string,
        @Body() dto: ReplyContactDto,
    ): Promise<ContactResponseDto> {
        const contact = await this.contactService.reply(id, dto);
        return plainToInstance(ContactResponseDto, contact, { excludeExtraneousValues: true });
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.contactService.delete(id);
    }
}
