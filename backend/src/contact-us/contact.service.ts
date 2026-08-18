import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact } from './entities/contact-us.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { EmailService } from 'src/utils/email.service';
import { contactReplyTemplate } from 'src/utils/email-templates/contactReply';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepo: Repository<Contact>,

        @InjectRepository(AdminUser)
        private readonly adminUserRepo: Repository<AdminUser>,

        private readonly mailService: EmailService,
    ) { }

    private validateCreate(dto: CreateContactDto) {
        const { fullName, email, subject, message } = dto;

        if (!fullName || fullName.trim().length < 3)
            throw new BadRequestException('Full name must be at least 3 characters');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            throw new BadRequestException('Invalid email address');

        if (!subject || subject.trim().length < 3 || subject.trim().length > 200)
            throw new BadRequestException('Subject must be 3–200 characters');

        if (!message || message.trim().length < 10 || message.trim().length > 3000)
            throw new BadRequestException('Message must be 10–3000 characters');
    }

    private validateReply(dto: ReplyContactDto) {
        const { reply, replySubject, repliedBy } = dto;

        if (!replySubject || replySubject.trim().length < 3 || replySubject.trim().length > 200)
            throw new BadRequestException('Reply subject must be 3–200 characters');

        if (!reply || reply.trim().length < 5 || reply.trim().length > 3000)
            throw new BadRequestException('Reply must be 5–3000 characters');

        if (!repliedBy)
            throw new BadRequestException('Admin user is required');
    }

    async create(dto: CreateContactDto): Promise<Contact> {
        this.validateCreate(dto);

        try {
            const contact = this.contactRepo.create({
                ...dto,
                fullName: dto.fullName.trim(),
                email: dto.email.trim().toLowerCase(),
                subject: dto.subject.trim(),
                message: dto.message.trim(),
            });

            return await this.contactRepo.save(contact);
        } catch (err) {
            throw new InternalServerErrorException('Failed to submit contact request');
        }
    }

    async findAll(
        page: any = 1,
        limit: any = 10,
        search?: string,
    ) {
        try {
            page = Math.max(1, +page);
            limit = Math.min(100, Math.max(1, +limit));

            const where = search
                ? [
                    { fullName: ILike(`%${search}%`) },
                    { email: ILike(`%${search}%`) },
                    { subject: ILike(`%${search}%`) },
                ]
                : {};

            const [data, total] = await this.contactRepo.findAndCount({
                where,
                relations: ['repliedBy'],
                order: { createdAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit,
            });

            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    showing: data.length,
                    currentPage: page,
                },
            };
        } catch (err) {
            throw new InternalServerErrorException('Failed to fetch contacts');
        }
    }

    async findOne(id: string): Promise<Contact> {
        const contact = await this.contactRepo.findOne({
            where: { id },
            relations: ['repliedBy'],
        });

        if (!contact)
            throw new NotFoundException('Contact not found');

        return contact;
    }

    async reply(id: string, dto: ReplyContactDto): Promise<Contact> {
        this.validateReply(dto);

        const contact = await this.contactRepo.findOne({ where: { id } });
        if (!contact)
            throw new NotFoundException('Contact not found');

        const admin = await this.adminUserRepo.findOne({
            where: { id: dto.repliedBy },
        });

        if (!admin)
            throw new NotFoundException('Admin user not found');

        try {
            contact.reply = dto.reply.trim();
            contact.replySubject = dto.replySubject.trim();
            contact.repliedAt = new Date();
            contact.repliedBy = admin;

            const saved = await this.contactRepo.save(contact);

            const emailHtml = contactReplyTemplate(
                contact.fullName,
                contact.replySubject,
                contact.reply,
            );

            await this.mailService.sendEmail(
                contact.email,
                contact.replySubject,
                emailHtml,
            );

            return saved;
        } catch (err) {
            throw new InternalServerErrorException('Failed to reply to contact');
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const result = await this.contactRepo.delete(id);

        if (!result.affected)
            throw new NotFoundException('Contact not found');

        return { message: 'Contact deleted successfully' };
    }
}
