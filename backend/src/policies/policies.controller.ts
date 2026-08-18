// src/policies/policies.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller('policies')
export class PoliciesController {
    constructor(private readonly service: PoliciesService) { }

    @Post('terms')
    createTerms(@Body() dto: CreatePolicyDto) {
        return this.service.createTerms(dto);
    }

    @Get('terms')
    getAllTerms() {
        return this.service.getAllTerms();
    }

    @Get('terms/:id')
    getTerm(@Param('id') id: string) {
        return this.service.getTermById(id);
    }

    @Put('terms/:id')
    updateTerm(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
        return this.service.updateTerm(id, dto);
    }

    @Delete('terms/:id')
    deleteTerm(@Param('id') id: string) {
        return this.service.deleteTerm(id);
    }

    @Post('privacy')
    createPrivacy(@Body() dto: CreatePolicyDto) {
        return this.service.createPrivacy(dto);
    }

    @Get('privacy')
    getAllPrivacy() {
        return this.service.getAllPrivacy();
    }

    @Get('privacy/:id')
    getPrivacy(@Param('id') id: string) {
        return this.service.getPrivacyById(id);
    }

    @Put('privacy/:id')
    updatePrivacy(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
        return this.service.updatePrivacy(id, dto);
    }

    @Delete('privacy/:id')
    deletePrivacy(@Param('id') id: string) {
        return this.service.deletePrivacy(id);
    }
}
