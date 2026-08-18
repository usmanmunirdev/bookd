import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from './booking-log.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ── Hotel: static routes first, THEN parameterised ────────────

  /**
   * Check hotel rate availability before checkout.
   * MUST be declared before hotel/:id or NestJS will treat
   * "check-availability" as the :id segment.
   */
  @Post('hotel/check-availability')
  @HttpCode(HttpStatus.OK)
  checkHotelAvailability(@Body() body: { rateKey: string }) {
    return this.bookingService.checkHotelRatePublic(body.rateKey);
  }

  @Post('hotel')
  @HttpCode(HttpStatus.CREATED)
  createHotel(@Body() dto: CreateHotelBookingDto) {
    return this.bookingService.createHotelBooking(dto);
  }

  @Get('hotel/:id')
  getHotel(@Param('id') id: string) {
    return this.bookingService.getHotelById(id);
  }

  // ── Flight: static routes first, THEN parameterised ───────────

  /**
   * Re-price a flight offer via Amadeus before checkout.
   * MUST be declared before flight/:id.
   */
  @Post('flight/check-availability')
  @HttpCode(HttpStatus.OK)
  checkFlightAvailability(@Body() body: { flightOffer: any }) {
    return this.bookingService.checkFlightOfferPublic(body.flightOffer);
  }

  /**
   * Seat map for a given Amadeus flight offer.
   * MUST be declared before flight/:id.
   */
  @Post('flight/seatmap')
  @HttpCode(HttpStatus.OK)
  getFlightSeatMap(@Body() body: { flightOffer: any }) {
    return this.bookingService.getFlightSeatMap(body.flightOffer);
  }

  @Post('flight')
  @HttpCode(HttpStatus.CREATED)
  createFlight(@Body() dto: CreateFlightBookingDto) {
    return this.bookingService.createFlightBooking(dto);
  }

  @Get('flight/:id')
  getFlight(@Param('id') id: string) {
    return this.bookingService.getFlightById(id);
  }

  // ── Payment Method ─────────────────────────────────────────────

  @Post('payment-method')
  @HttpCode(HttpStatus.OK)
  addPaymentMethod(@Body() body: { userId: string; paymentMethodId: string }) {
    return this.bookingService.addPaymentMethod(body.userId, body.paymentMethodId);
  }

  // ── Booking Logs ───────────────────────────────────────────────

  @Get('logs')
  async getBookingLogs(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('userId') userId: string,
    @Query('priceRange') priceRange?: string,
    @Query('destination') destination?: string,
    @Query('search') search?: string,
  ) {
    try {
      const result = await this.bookingService.getAllBookingLogs(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        userId,
        priceRange,
        destination,
        search,
      );
      return { success: true, message: 'Booking logs fetched successfully', ...result };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}