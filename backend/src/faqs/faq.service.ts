import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { FaqCategory } from './entities/faq-category.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export class FaqQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
}

@Injectable()
export class FaqService {
    constructor(
        @InjectRepository(Faq)
        private readonly faqRepo: Repository<Faq>,

        @InjectRepository(FaqCategory)
        private readonly categoryRepo: Repository<FaqCategory>,
    ) { }

    // ---------------- CATEGORY CRUD ----------------

    async createCategory(dto: CreateCategoryDto) {
        try {
            if (!dto?.name?.trim()) {
                throw new BadRequestException('Category name is required');
            }

            const exists = await this.categoryRepo.findOne({
                where: { name: dto.name.trim() },
            });

            if (exists) {
                throw new BadRequestException('Category already exists');
            }

            const category = this.categoryRepo.create({
                ...dto,
                name: dto.name.trim(),
            });

            return await this.categoryRepo.save(category);
        } catch (err) {
            if (err instanceof BadRequestException) throw err;
            throw new InternalServerErrorException('Failed to create category');
        }
    }

    async findAllCategories() {
        try {
            return await this.categoryRepo.find({
                relations: ['faqs'],
            });
        } catch (err) {
            throw new InternalServerErrorException('Failed to fetch categories');
        }
    }

    async updateCategory(id: string, dto: UpdateCategoryDto) {
        try {
            if (!id) throw new BadRequestException('Invalid category id');

            const category = await this.categoryRepo.findOne({ where: { id } });

            if (!category) {
                throw new NotFoundException('Category not found');
            }

            Object.assign(category, dto);

            return await this.categoryRepo.save(category);
        } catch (err) {
            if (
                err instanceof BadRequestException ||
                err instanceof NotFoundException
            )
                throw err;

            throw new InternalServerErrorException('Failed to update category');
        }
    }

    async deleteCategory(id: string) {
        try {
            if (!id) throw new BadRequestException('Invalid category id');

            const category = await this.categoryRepo.findOne({ where: { id } });

            if (!category) {
                throw new NotFoundException('Category not found');
            }

            await this.categoryRepo.delete(id);

            return { message: 'Category deleted successfully' };
        } catch (err) {
            if (
                err instanceof BadRequestException ||
                err instanceof NotFoundException
            )
                throw err;
            throw new InternalServerErrorException('Failed to delete category');
        }
    }

    // ---------------- FAQ CRUD ----------------

    async createFaq(dto: CreateFaqDto) {
        try {
            if (!dto?.question?.trim()) {
                throw new BadRequestException('Question is required');
            }

            if (!dto?.answer?.trim()) {
                throw new BadRequestException('Answer is required');
            }

            if (!dto?.categoryId) {
                throw new BadRequestException('Category id is required');
            }

            const category = await this.categoryRepo.findOne({
                where: { id: dto.categoryId },
            });

            if (!category) throw new NotFoundException('Category not found');

            const faq = this.faqRepo.create({
                question: dto.question.trim(),
                answer: dto.answer.trim(),
                category,
            });

            return await this.faqRepo.save(faq);
        } catch (err) {
            if (
                err instanceof BadRequestException ||
                err instanceof NotFoundException
            )
                throw err;

            throw new InternalServerErrorException('Failed to create FAQ');
        }
    }

    async findAllFaqs(query: FaqQueryDto) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                categoryId,
            } = query;

            const qb = this.faqRepo
                .createQueryBuilder('faq')
                .leftJoinAndSelect('faq.category', 'category')
                .orderBy('faq.id', 'DESC');

            if (search) {
                qb.andWhere(
                    '(faq.question ILIKE :search OR faq.answer ILIKE :search)',
                    { search: `%${search}%` },
                );
            }

            if (categoryId) {
                qb.andWhere('faq.categoryId = :categoryId', { categoryId });
            }

            const [data, total] = await qb
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    showing: data.length,
                    currentPage: page,
                } as any
            };
        } catch (err) {
            throw new InternalServerErrorException('Failed to fetch FAQs');
        }
    }

    async updateFaq(id: string, dto: UpdateFaqDto) {
        try {
            if (!id) throw new BadRequestException('Invalid faq id');

            const faq = await this.faqRepo.findOne({
                where: { id },
                relations: ['category'],
            });

            if (!faq) throw new NotFoundException('FAQ not found');

            if (dto.categoryId) {
                const category = await this.categoryRepo.findOne({
                    where: { id: dto.categoryId },
                });

                if (!category) throw new NotFoundException('Category not found');

                faq.category = category;
            }

            if (dto.question) faq.question = dto.question.trim();
            if (dto.answer) faq.answer = dto.answer.trim();

            return await this.faqRepo.save(faq);
        } catch (err) {
            if (
                err instanceof BadRequestException ||
                err instanceof NotFoundException
            )
                throw err;

            throw new InternalServerErrorException('Failed to update FAQ');
        }
    }

    async deleteFaq(id: string) {
        try {
            if (!id) throw new BadRequestException('Invalid faq id');

            const faq = await this.faqRepo.findOne({ where: { id } });

            if (!faq) throw new NotFoundException('FAQ not found');

            await this.faqRepo.delete(id);

            return { message: 'FAQ deleted successfully' };
        } catch (err) {
            if (
                err instanceof BadRequestException ||
                err instanceof NotFoundException
            )
                throw err;

            throw new InternalServerErrorException('Failed to delete FAQ');
        }
    }
}
