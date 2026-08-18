import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { AddPaymentMethodDto } from './dto/add-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private stripeService: StripePaymentService) { }

  @Post('/setup-intent/:userId')
  createSetupIntent(@Param('userId') userId: string) {
    return this.stripeService.createSetupIntent(userId);
  }

  @Post('/add/:userId')
  addPaymentMethod(
    @Param('userId') userId: string,
    @Body() dto: AddPaymentMethodDto
  ) {
    return this.stripeService.addPaymentMethod(userId, dto.paymentMethodId);
  }

  @Get('/list/:userId')
  listPaymentMethods(@Param('userId') userId: string) {
    return this.stripeService.listPaymentMethods(userId);
  }
}
