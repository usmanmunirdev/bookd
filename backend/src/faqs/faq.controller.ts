import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) { }

    @Post('category')
    createCategory(@Body() dto: CreateCategoryDto) {
        return this.faqService.createCategory(dto);
    }

    @Get('category')
    findAllCategories() {
        return this.faqService.findAllCategories();
    }

    @Patch('category/:id')
    updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.faqService.updateCategory(id, dto);
    }

    @Delete('category/:id')
    deleteCategory(@Param('id') id: string) {
        return this.faqService.deleteCategory(id);
    }

    @Post()
    createFaq(@Body() dto: CreateFaqDto) {
        return this.faqService.createFaq(dto);
    }

    @Get()
    findAllFaqs(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.faqService.findAllFaqs({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
            categoryId: categoryId ? categoryId : undefined,
        });
    }


    @Patch(':id')
    updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
        return this.faqService.updateFaq(id, dto);
    }

    @Delete(':id')
    deleteFaq(@Param('id') id: string) {
        return this.faqService.deleteFaq(id);
    }
}
