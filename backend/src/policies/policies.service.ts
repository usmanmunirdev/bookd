// src/policies/policies.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsConditions } from './entities/terms-conditions.entity';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PoliciesService {
    constructor(
        @InjectRepository(TermsConditions)
        private termsRepo: Repository<TermsConditions>,

        @InjectRepository(PrivacyPolicy)
        private privacyRepo: Repository<PrivacyPolicy>,
    ) { }

    async createTerms(dto: CreatePolicyDto) {
        try {
            const term = this.termsRepo.create(dto);
            return await this.termsRepo.save(term);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create Terms & Conditions');
        }
    }

    async getAllTerms() {
        try {
            return await this.termsRepo.find({ order: { createdAt: 'DESC' } });
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch Terms & Conditions');
        }
    }

    async getTermById(id: string) {
        try {
            const term = await this.termsRepo.findOne({ where: { id } });
            if (!term) throw new NotFoundException('Terms & Conditions not found');
            return term;
        } catch (error) {
            throw error;
        }
    }

    async updateTerm(id: string, dto: UpdatePolicyDto) {
        try {
            const term = await this.getTermById(id);
            Object.assign(term, dto);
            return await this.termsRepo.save(term);
        } catch (error) {
            throw new InternalServerErrorException('Failed to update Terms & Conditions');
        }
    }

    async deleteTerm(id: string) {
        try {
            const result = await this.termsRepo.delete(id);
            if (!result.affected) throw new NotFoundException('Terms & Conditions not found');
            return { message: 'Deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete Terms & Conditions');
        }
    }

    async createPrivacy(dto: CreatePolicyDto) {
        try {
            const policy = this.privacyRepo.create(dto);
            return await this.privacyRepo.save(policy);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create Privacy Policy');
        }
    }

    async getAllPrivacy() {
        try {
            return await this.privacyRepo.find({ order: { createdAt: 'DESC' } });
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch Privacy Policy');
        }
    }

    async getPrivacyById(id: string) {
        try {
            const policy = await this.privacyRepo.findOne({ where: { id } });
            if (!policy) throw new NotFoundException('Privacy Policy not found');
            return policy;
        } catch (error) {
            throw error;
        }
    }

    async updatePrivacy(id: string, dto: UpdatePolicyDto) {
        try {
            const policy = await this.getPrivacyById(id);
            Object.assign(policy, dto);
            return await this.privacyRepo.save(policy);
        } catch (error) {
            throw new InternalServerErrorException('Failed to update Privacy Policy');
        }
    }

    async deletePrivacy(id: string) {
        try {
            const result = await this.privacyRepo.delete(id);
            if (!result.affected) throw new NotFoundException('Privacy Policy not found');
            return { message: 'Deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete Privacy Policy');
        }
    }
}
