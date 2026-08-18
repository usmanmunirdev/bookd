import {
  Controller,
  Post,
  Delete,
  Body,
  Req,
  Headers,
  HttpCode,
  Logger,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Request } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { GetSubscriptionPaymentsDto } from "./dto/get-subscription-payments.dto";

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly configService: ConfigService,
  ) { }

  @Post('create')
  async createSubscription(
    @Req() req: any,
    @Body() body: { planId: string },
  ) {
    return this.subscriptionService.createSubscription(
      req.user.sub,
      body.planId,
    );
  }

  @Post('cancel')
  async cancelSubscription(
    @Req() req: any,
  ) {
    return this.subscriptionService.cancelSubscription(
      req.user.sub,
    );
  }

  @Post('re-activate')
  async reactivateSubscription(
    @Req() req: any,
  ) {
    return this.subscriptionService.reactivateSubscription(
      req.user.sub,
    );
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') sig: string,
  ) {
    console.log('Received Stripe webhook');
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!sig || !webhookSecret) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // ⚡ Ensure req.body is a Buffer
    if (!Buffer.isBuffer(req.body)) {
      this.logger.error('Stripe webhook body is not a Buffer!');
      throw new BadRequestException('Invalid raw body');
    }

    let event: Stripe.Event;

    try {
      const stripe = new Stripe(
        this.configService.get<string>('STRIPE_SECRET_KEY')!,
        { apiVersion: '2025-08-27.basil' },
      );

      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      this.logger.error(err.message);
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    await this.subscriptionService.handleWebhook(event);
    return { received: true };
  }

  @Get('payment-history')
  async getPayments(
    @Query() query: GetSubscriptionPaymentsDto,
  ) {
    return this.subscriptionService.getPayments(query);
  }

}
