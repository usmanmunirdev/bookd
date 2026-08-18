import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PlansService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
    private configService: ConfigService,

  ) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async create(data: CreatePlanDto): Promise<Plan> {
    try {
      const exists = await this.repo.findOne({ where: { title: data.title } });
      if (exists) throw new BadRequestException('Plan with this title already exists');

      // 1️⃣ Create Stripe Product
      const product = await this.stripe.products.create({
        name: data.title,
        description: data.description,
      });

      // 2️⃣ Create Stripe Price (amount in cents)
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(data.price * 100), // Stripe expects cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
      });

      // 3️⃣ Save in DB
      const plan = this.repo.create({
        ...data,
        stripeProductId: product.id,
        stripePriceId: price.id,
      });

      return await this.repo.save(plan);
    } catch (error) {
      console.error('Create Plan Error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create plan');
    }
  }

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    try {
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const skip = (page - 1) * limit;

      const where = params.search
        ? [
          { title: ILike(`%${params.search}%`) },
          { description: ILike(`%${params.search}%`) },
        ]
        : {};

      const [data, total] = await this.repo.findAndCount({
        where,
        order: {
          price: 'ASC', // ✅ smallest price first
        },
        skip,
        take: limit,
      });

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Find Plans Error:', error);
      throw new InternalServerErrorException('Failed to fetch plans');
    }
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    try {
      const plan = await this.repo.findOne({ where: { id } });
      if (!plan) throw new NotFoundException('Plan not found');

      if (data.title && data.title.trim() === '') {
        throw new BadRequestException('Title cannot be empty');
      }

      // If price changed → create new Stripe Price
      if (data.price !== undefined && data.price !== plan.price) {
        if (!plan.stripeProductId) {
          // If somehow productId missing → create product
          const product = await this.stripe.products.create({
            name: data.title || plan.title,
            description: data.description || plan.description,
          });
          plan.stripeProductId = product.id;
        }

        const price = await this.stripe.prices.create({
          unit_amount: Math.round(data.price * 100),
          currency: 'usd',
          recurring: { interval: 'month' },
          product: plan.stripeProductId,
        });

        plan.stripePriceId = price.id;
      }

      Object.assign(plan, data);
      return await this.repo.save(plan);
    } catch (error) {
      console.error('Update Plan Error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update plan');
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
