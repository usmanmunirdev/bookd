import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import Stripe from 'stripe';
import { BookingLog } from './entities/booking-log.entity';
import { HotelBooking } from './entities/hotel-booking.entity';
import { FlightBooking } from './entities/flight-booking.entity';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { EmailService } from 'src/utils/email.service';
import { SmsService } from 'src/utils/sms.service';
import { flightBookingTemplate } from 'src/utils/email-templates/flightBookingConfirmation';
import { hotelBookingTemplate } from 'src/utils/email-templates/hotelBookingConfirmation';
import { User } from '../user/entities/user.entity';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// ─── Tax / price helpers ───────────────────────────────────────────────────────

function extractTotalTaxes(pricedOffer: any): number {
  const pricings: any[] = pricedOffer?.travelerPricings ?? [];
  return pricings.reduce((sum, tp) => {
    const taxes: any[] = tp?.price?.taxes ?? [];
    return sum + taxes.reduce((s, t) => s + Number(t.amount ?? 0), 0);
  }, 0);
}

function extractTotalFees(pricedOffer: any): number {
  const fees: any[] = pricedOffer?.price?.fees ?? [];
  return fees.reduce((sum, f) => sum + Number(f.amount ?? 0), 0);
}

function parsePhone(raw: string): { countryCallingCode: string; number: string } {
  const digits = raw.replace(/\D/g, '');
  if (digits.length > 10) {
    const codeLen = digits.length - 10;
    return {
      countryCallingCode: digits.slice(0, codeLen),
      number: digits.slice(codeLen),
    };
  }
  return { countryCallingCode: '1', number: digits };
}

/**
 * ─── MULTI-TRAVELER FIX ───────────────────────────────────────────────────────
 *
 * The original flightOffer from search is priced for 1 traveler. When the user
 * adds more travelers on the booking page, we must:
 *
 * 1. Set travelerPricings to have one entry per traveler (by type).
 * 2. Set the top-level flightOffer.travelerPricings count to match travelers.
 * 3. Keep fareDetailsBySegment from the template so cabin/baggage info is preserved.
 * 4. Let Amadeus /pricing recalculate the grandTotal for all travelers.
 *
 * Amadeus prices each traveler type independently:
 *   - ADULT, CHILD, INFANT may have different base fares
 *   - The returned grandTotal will be the sum for ALL travelers
 *
 * NOTE: The per-person price stays the same (e.g. 207 each), but grandTotal
 * becomes 207 × N. This is the correct and expected behavior.
 */
function rebuildTravelerPricings(
  flightOffer: any,
  travelers: Array<{ id: string; type: 'ADULT' | 'CHILD' | 'INFANT' }>,
): any {
  // Find template pricings by traveler type for accurate fare details
  const existingPricings: any[] = flightOffer.travelerPricings ?? [];

  // Build a map of type → template pricing (prefer matching type, fallback to ADULT template)
  const templateByType = new Map<string, any>();
  for (const pricing of existingPricings) {
    templateByType.set(pricing.travelerType, pricing);
  }
  const adultTemplate = templateByType.get('ADULT') ?? existingPricings[0] ?? {};

  const rebuilt = travelers.map((t, index) => {
    const template = templateByType.get(t.type) ?? adultTemplate;

    return {
      // Preserve fareDetailsBySegment, cabin class, baggage info from template
      ...template,
      // Override travelerId with sequential 1-based index
      travelerId: String(index + 1),
      // Set the correct traveler type
      travelerType: t.type,
      // Clear computed price fields — Amadeus /pricing will recalculate per type
      price: template.price
        ? {
          ...template.price,
          total: undefined,
          grandTotal: undefined,
          // Keep base, taxes structure for Amadeus to rebuild
        }
        : undefined,
    };
  });

  // Count travelers by type for the top-level offer
  const adultCount = travelers.filter(t => t.type === 'ADULT').length;
  const childCount = travelers.filter(t => t.type === 'CHILD').length;
  const infantCount = travelers.filter(t => t.type === 'INFANT').length;

  return {
    ...flightOffer,
    // Update the quantity to reflect actual booking (some GDS use this)
    ...(flightOffer.numberOfBookableSeats !== undefined
      ? { numberOfBookableSeats: Math.max(flightOffer.numberOfBookableSeats, travelers.length) }
      : {}),
    travelerPricings: rebuilt,
    // Some Amadeus offers carry a travelerPricings count at top level
    _travelerCount: travelers.length,
    // Preserve original price for reference but Amadeus will recalculate
    price: flightOffer.price
      ? {
        ...flightOffer.price,
        total: undefined,
        grandTotal: undefined,
        base: undefined,
      }
      : flightOffer.price,
  };
}

/**
 * Convert raw internal API errors into user-friendly messages.
 */
function toUserFriendlyError(raw: string): string {
  const lower = raw.toLowerCase();

  // ── Amadeus field-level validation errors (pass through directly) ─────────
  // createAmadeusFlightOrder throws "Amadeus error: <detail1>; <detail2>"
  // These are already human-readable — show them as-is.
  if (lower.startsWith('amadeus error:')) {
    return raw.replace(/^amadeus error:\s*/i, '').trim();
  }

  if (lower.includes('not priced') || lower.includes('traveler is not priced') || lower.includes('traveller')) {
    return 'One or more travelers could not be processed. Please check all traveler details and try again.';
  }
  if (lower.includes('passport') || lower.includes('document')) {
    return "There is an issue with a traveler's passport details. Please verify all passport information and try again.";
  }
  if (lower.includes('seat') && lower.includes('not available')) {
    return 'Your selected seat is no longer available. Please choose a different seat or skip seat selection.';
  }
  if (lower.includes('price') && (lower.includes('changed') || lower.includes('difference'))) {
    return 'The price has changed since your search. Please go back and search again.';
  }
  if (lower.includes('no longer available') || lower.includes('sold out')) {
    return 'This option is no longer available. Please search for alternatives.';
  }
  if (lower.includes('payment failed') || lower.includes('payment error')) {
    return 'Payment could not be processed. Please check your card details or use a different payment method.';
  }
  if (lower.includes('amadeus') || lower.includes('hotelbeds')) {
    return 'The booking system encountered an issue. Please try again in a few minutes.';
  }

  return 'Your booking could not be completed. Please try again or contact support if the issue persists.';
}

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly API_TIMEOUT = 20000; // Increased timeout for multi-traveler pricing
  private stripe: Stripe;

  constructor(
    @InjectRepository(BookingLog)
    private bookingLogRepo: Repository<BookingLog>,

    @InjectRepository(HotelBooking)
    private hotelRepo: Repository<HotelBooking>,

    @InjectRepository(FlightBooking)
    private flightRepo: Repository<FlightBooking>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly calendarService: GoogleCalendarService,
    private mailService: EmailService,
    private smsService: SmsService,
    private readonly configService: ConfigService,
  ) { }

  onModuleInit() {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not configured');
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
  }

  // ─────────────────────────────────────────────────────────────
  //  HOTEL BOOKING
  // ─────────────────────────────────────────────────────────────

  async createHotelBooking(dto: CreateHotelBookingDto) {
    const user = await this.getUserWithSubscription(dto.userId);

    const rateData = await this.checkRateAvailability(dto.rateKey);
    if (!rateData) {
      throw new HttpException(
        'This room is no longer available. Please search again.',
        HttpStatus.GONE,
      );
    }

    const confirmedRate = rateData.rooms?.[0]?.rates?.[0];
    const latestRateKey = confirmedRate?.rateKey ?? dto.rateKey;
    const pricePerRoom = Number(confirmedRate?.net ?? rateData.totalNet ?? 0);
    const numberOfRooms = Math.max(1, dto.rooms ?? 1);
    const initialNet = pricePerRoom * numberOfRooms;
    const currency: string = rateData.currency || 'EUR';

    const savedLog = await this.bookingLogRepo.save(
      this.bookingLogRepo.create({
        userId: dto.userId,
        bookingType: 'hotel',
        status: 'pending',
        totalAmount: initialNet,
        currency,
      }),
    );

    let stripePaymentIntentId: string | null = null;
    let stripeChargeId: string | null = null;

    try {
      const hbBooking = await this.bookWithHotelbeds({ ...dto, rateKey: latestRateKey }, user);

      if (hbBooking.status !== 'CONFIRMED') {
        throw new Error('Hotelbeds booking not confirmed');
      }

      const room = hbBooking.hotel.rooms?.[0];
      const rate = room?.rates?.[0];

      const confirmedPricePerRoom = Number(rate?.net ?? pricePerRoom);
      const finalNet = confirmedPricePerRoom * numberOfRooms;
      const paymentType = rate?.paymentType ?? 'AT_WEB';

      if (paymentType === 'AT_WEB') {
        await this.ensureStripeCustomer(user, dto.paymentMethodId);

        if (!user.paymentMethodId) {
          throw new BadRequestException('Payment method required for prepaid hotel');
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(finalNet * 100),
          currency: currency.toLowerCase(),
          customer: user.stripeCustomerId!,
          payment_method: user.paymentMethodId!,
          confirm: true,
          off_session: true,
          description: `Hotel: ${hbBooking.hotel.name} × ${numberOfRooms} room(s), ${dto.adults ?? 1} adult(s)`,
          metadata: {
            bookingLogId: savedLog.id,
            rooms: String(numberOfRooms),
            adults: String(dto.adults ?? 1),
            children: String(dto.children ?? 0),
          },
        });

        if (
          paymentIntent.status !== 'succeeded' &&
          paymentIntent.status !== 'requires_capture'
        ) {
          throw new Error(`Payment failed: ${paymentIntent.status}`);
        }

        stripePaymentIntentId = paymentIntent.id;
        stripeChargeId =
          typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : (paymentIntent.latest_charge as Stripe.Charge | null)?.id ?? null;
      }

      const cancellationPolicies = rate?.cancellationPolicies || [];
      const nights = this.calculateNights(hbBooking.hotel.checkIn, hbBooking.hotel.checkOut);

      const roomDetails = {
        code: room?.code,
        name: room?.name,
        supplierName: room?.supplierName,
        description: room?.description,
        rates: room?.rates?.map((r: any) => ({
          rateKey: r.rateKey,
          rateType: r.rateType,
          net: r.net,
          sellingRate: r.sellingRate,
          hotelMandatory: r.hotelMandatory,
          allotment: r.allotment,
          commission: r.commission,
          commissionVAT: r.commissionVAT,
          commissionPct: r.commissionPct,
          cost: r.cost,
          rateCommentsId: r.rateCommentsId,
          rateComments: r.rateComments,
          paymentType: r.paymentType,
          packaging: r.packaging,
          boardCode: r.boardCode,
          boardName: r.boardName,
          cancellationPolicies: r.cancellationPolicies,
          taxes: r.taxes,
          facilities: r.facilities,
          dailyRates: r.dailyRates,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          paxes: r.paxes,
        })),
      };

      const hotelBooking: any = await this.hotelRepo.save(
        this.hotelRepo.create({
          bookingLog: savedLog,
          hotelbedsReference: hbBooking.reference,
          clientReference: `BHTL${Date.now().toString().slice(-10)}`,
          hotelId: String(hbBooking.hotel.code),
          hotelName: hbBooking.hotel.name,
          destinationName: dto.destinationName ?? hbBooking.hotel.destinationName ?? null,
          destinationCode: dto.destinationCode ?? hbBooking.hotel.destinationCode ?? null,
          address: dto.address ?? hbBooking.hotel.address ?? null,
          postalCode: dto.postalCode ?? hbBooking.hotel.postalCode ?? null,
          city: dto.city ?? hbBooking.hotel.city ?? null,
          countryCode: dto.countryCode ?? hbBooking.hotel.countryCode ?? null,
          latitude: dto.latitude ?? hbBooking.hotel.latitude ?? null,
          longitude: dto.longitude ?? hbBooking.hotel.longitude ?? null,
          category: dto.category ?? hbBooking.hotel.categoryCode ?? null,
          categoryName: dto.categoryName ?? hbBooking.hotel.categoryName ?? null,
          rating: dto.rating ? Number(dto.rating) : null,
          images: dto.images?.length ? dto.images : null,
          amenities: dto.amenities?.length ? dto.amenities : null,
          phone: dto.hotelPhone ?? hbBooking.hotel.phones?.[0]?.phoneNumber ?? null,
          email: dto.hotelEmail ?? hbBooking.hotel.email ?? null,
          website: dto.website ?? hbBooking.hotel.web ?? null,
          chainName: dto.chainName ?? hbBooking.hotel.chainName ?? null,
          description: dto.description ?? null,
          checkInDate: new Date(hbBooking.hotel.checkIn),
          checkOutDate: new Date(hbBooking.hotel.checkOut),
          nights,
          adults: dto.adults ?? 1,
          children: dto.children ?? 0,
          childrenAges: dto.childrenAges?.length ? dto.childrenAges : null,
          rooms: numberOfRooms,
          roomCode: room?.code ?? null,
          roomType: room?.name ?? null,
          roomDescription: room?.description ?? null,
          boardCode: rate?.boardCode ?? dto.boardCode ?? null,
          boardName: rate?.boardName ?? dto.boardName ?? null,
          rateType: rate?.rateType ?? null,
          rateComments: rate?.rateComments ?? null,
          rateCommentsId: rate?.rateCommentsId ?? null,
          allotment: rate?.allotment ?? null,
          packaging: rate?.packaging ?? false,
          supplements: rate?.supplements ?? null,
          taxes: rate?.taxes ?? null,
          facilities: rate?.facilities ?? null,
          roomDetails: roomDetails ?? null,
          paymentType,
          totalPrice: finalNet,
          netPrice: confirmedPricePerRoom,
          sellingRate: Number(rate?.sellingRate ?? confirmedPricePerRoom),
          currency,
          commission: rate?.commission ?? null,
          commissionPct: rate?.commissionPct ?? null,
          cancellationPolicies: cancellationPolicies.length ? cancellationPolicies : null,
          cancellationDeadline: cancellationPolicies[0]?.from ? new Date(cancellationPolicies[0].from) : null,
          freeCancellationDeadline: this.extractFreeCancellationDeadline(cancellationPolicies),
          nonRefundable: cancellationPolicies.some((p: any) => p.type === 'NONREFUND'),
          holderName: dto.holderName,
          holderSurname: dto.holderSurname,
          holderEmail: dto.holderEmail,
          holderPhone: dto.holderPhone ?? null,
          rawHotelResponse: hbBooking ?? null,
          stripePaymentIntentId,
          stripeChargeId,
          paymentStatus: paymentType === 'AT_WEB' ? 'paid' : 'pay_at_hotel',
        }),
      );

      await this.bookingLogRepo.update(savedLog.id, { status: 'confirmed', stripePaymentIntentId });
      this.sendHotelNotifications(user, hotelBooking, hbBooking.reference).catch(console.error);

      return {
        message: paymentType === 'AT_WEB' ? 'Hotel booking confirmed & paid' : 'Hotel booking confirmed. Pay at hotel.',
        booking: hotelBooking,
      };
    } catch (err) {
      const rawMessage = (err as Error).message || '';

      if (rawMessage.includes('price difference exceeds')) {
        const newRateData = await this.checkRateAvailability(latestRateKey);
        const newRate = newRateData?.rooms?.[0]?.rates?.[0];
        const newPricePerRoom = Number(newRate?.net ?? newRateData?.totalNet ?? 0);
        return {
          priceChanged: true,
          message: 'Price has changed. Please confirm the updated price.',
          oldPrice: initialNet,
          newPrice: newPricePerRoom * numberOfRooms,
          currency,
          newRateKey: newRate?.rateKey,
        };
      }

      await this.bookingLogRepo.update(savedLog.id, { status: 'failed', failureReason: rawMessage });

      if (stripePaymentIntentId) {
        await this.stripe.refunds.create({ payment_intent: stripePaymentIntentId });
      }

      throw new HttpException(toUserFriendlyError(rawMessage), HttpStatus.BAD_REQUEST);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  FLIGHT BOOKING — MULTI-TRAVELER FIX
  // ─────────────────────────────────────────────────────────────

  async createFlightBooking(dto: CreateFlightBookingDto) {
    const user = await this.getUserWithSubscription(dto.userId);
    const travelerCount = dto.travelers.length;

    await this.ensureStripeCustomer(user, dto.paymentMethodId);

    if (!user.paymentMethodId) {
      throw new BadRequestException('No payment method on file. Please provide a paymentMethodId.');
    }

    const accessToken = await this.getAmadeusToken();

    // ── STEP 1: Rebuild travelerPricings for actual traveler count ──────────────
    // 
    // The flightOffer from search is always priced for however many travelers were
    // in the original search query (usually 1). We rebuild travelerPricings to have
    // exactly N entries (one per traveler) before sending to /pricing.
    //
    // Amadeus /pricing will then:
    //   - Price each traveler by type (ADULT/CHILD/INFANT)  
    //   - Return a grandTotal = sum of all traveler fares
    //   - Assign travelerPricing IDs we must use in the flight-order
    //
    // Example: 1 traveler @ 207 USD → 2 travelers @ 207 each → grandTotal = 414 USD
    const flightOfferForPricing = rebuildTravelerPricings(dto.flightOffer, dto.travelers);

    console.log(
      `[Flight Pricing] ${travelerCount} traveler(s): ` +
      dto.travelers.map((t, i) => `T${i + 1}:${t.type}`).join(', '),
    );

    // ── STEP 2: Price with Amadeus ─────────────────────────────────────────────
    let pricedOffer: any;
    try {
      pricedOffer = await this.priceFlightOffer(accessToken, flightOfferForPricing);
    } catch (pricingErr: any) {
      console.error('[Flight Pricing] Error:', pricingErr.response?.data ?? pricingErr.message);
      throw new HttpException(
        'This flight is no longer available or could not be priced. Please search again.',
        HttpStatus.GONE,
      );
    }

    // ── STEP 3: Validate Amadeus returned correct traveler count ───────────────
    const pricedTravelerIds: string[] =
      pricedOffer.travelerPricings?.map((tp: any) => String(tp.travelerId)) ?? [];

    if (pricedTravelerIds.length !== travelerCount) {
      // Amadeus returned fewer pricings than travelers — retry with explicit IDs
      console.warn(
        `[Flight Pricing] Mismatch: sent ${travelerCount} travelers, got ${pricedTravelerIds.length} pricings. Retrying with explicit seat count.`,
      );
      throw new HttpException(
        `Pricing mismatch: the airline could not price all ${travelerCount} travelers. Please try again.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const grandTotal = Number(pricedOffer.price?.grandTotal ?? 0);
    const baseFare = Number(pricedOffer.price?.base ?? 0);
    const totalTaxes = extractTotalTaxes(pricedOffer);
    const totalFees = extractTotalFees(pricedOffer);
    const currency: string = pricedOffer.price?.currency ?? 'USD';
    const perPersonPrice = travelerCount > 0 ? grandTotal / travelerCount : grandTotal;

    console.log(
      `[Flight Pricing] grandTotal=${grandTotal} ${currency} (${travelerCount} × ~${perPersonPrice.toFixed(2)})`,
    );

    // ── STEP 4: Optionally fetch seat map ──────────────────────────────────────
    let seatMapData: any[] | null = null;
    if (dto.seatPreferences?.length) {
      try {
        seatMapData = await this.getSeatMap(accessToken, pricedOffer);
      } catch (e) {
        console.warn('Seat map fetch failed, continuing:', (e as Error).message);
      }
    }

    // ── STEP 5: Save pending log ───────────────────────────────────────────────
    const savedLog = await this.bookingLogRepo.save(
      this.bookingLogRepo.create({
        userId: dto.userId,
        bookingType: 'flight',
        status: 'pending',
        totalAmount: grandTotal,
        currency,
      }),
    );

    let stripePaymentIntentId: string | null = null;
    let stripeChargeId: string | null = null;

    try {
      const firstSeg = pricedOffer?.itineraries?.[0]?.segments?.[0];
      const lastSeg = pricedOffer?.itineraries?.[0]?.segments?.at(-1);

      // ── STEP 6: Charge Stripe for grandTotal (all travelers) ─────────────────
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(grandTotal * 100),
        currency: currency.toLowerCase(),
        customer: user.stripeCustomerId!,
        payment_method: user.paymentMethodId!,
        confirm: true,
        off_session: true,
        description:
          `Flight ${firstSeg?.carrierCode ?? ''}${firstSeg?.number ?? ''}: ` +
          `${firstSeg?.departure?.iataCode ?? ''} → ${lastSeg?.arrival?.iataCode ?? ''} ` +
          `(${travelerCount} traveler${travelerCount > 1 ? 's' : ''})`,
        metadata: {
          userId: dto.userId,
          bookingLogId: savedLog.id,
          travelerCount: String(travelerCount),
          perPersonPrice: perPersonPrice.toFixed(2),
          baseFare: String(baseFare),
          taxes: String(totalTaxes),
          fees: String(totalFees),
          currency,
        },
      });

      if (
        paymentIntent.status !== 'succeeded' &&
        paymentIntent.status !== 'requires_capture'
      ) {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }

      stripePaymentIntentId = paymentIntent.id;
      stripeChargeId =
        typeof paymentIntent.latest_charge === 'string'
          ? paymentIntent.latest_charge
          : (paymentIntent.latest_charge as Stripe.Charge | null)?.id ?? null;

      // ── STEP 7: Create Amadeus flight order ──────────────────────────────────
      const amadeusOrder = await this.createAmadeusFlightOrder(accessToken, pricedOffer, dto);
      const orderData = amadeusOrder.data;

      const firstItinerary = pricedOffer.itineraries?.[0];
      const firstSegment = firstItinerary?.segments?.[0];
      const lastSegment = firstItinerary?.segments?.at(-1);

      const seatAssignments = this.extractSeatAssignments(orderData, dto.seatPreferences);

      const flightBookingData: Partial<FlightBooking> = {
        bookingLog: savedLog,
        amadeusOrderId: orderData.id ?? null,
        pnr: orderData.associatedRecords?.[0]?.reference ?? null,
        clientReference: `BOOKD-FLT-${Date.now()}`,
        airlineName: firstSegment?.carrierCode ?? '',
        airlineCode: firstSegment?.carrierCode ?? '',
        airlineLogo: null,
        flightNumber: `${firstSegment?.carrierCode ?? ''}${firstSegment?.number ?? ''}`,
        departureAirport: firstSegment?.departure?.iataCode ?? '',
        departureTerminal: firstSegment?.departure?.terminal ?? null,
        departureCity: null,
        departureCountry: null,
        departureAirportName: null,
        departureTime: new Date(firstSegment?.departure?.at),
        arrivalAirport: lastSegment?.arrival?.iataCode ?? '',
        arrivalTerminal: lastSegment?.arrival?.terminal ?? null,
        arrivalCity: null,
        arrivalCountry: null,
        arrivalAirportName: null,
        arrivalTime: new Date(lastSegment?.arrival?.at),
        duration: firstItinerary?.duration ?? null,
        travelClass:
          pricedOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? null,
        isDirectFlight: (firstItinerary?.segments?.length ?? 1) === 1,
        numberOfStops: (firstItinerary?.segments?.length ?? 1) - 1,
        segments: firstItinerary?.segments ?? null,
        itineraries: pricedOffer.itineraries ?? null,
        adults: dto.travelers.filter((t) => t.type === 'ADULT').length,
        children: dto.travelers.filter((t) => t.type === 'CHILD').length,
        infants: dto.travelers.filter((t) => t.type === 'INFANT').length,
        travelers: dto.travelers as any,
        seatAssignments: seatAssignments.length ? seatAssignments : null,
        includedBaggage:
          pricedOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags ?? null,
        baggageAllowance: null,
        ticketPrice: grandTotal,
        baseFare,
        taxes: totalTaxes || null,
        fees: totalFees || null,
        currency,
        travelerPricings: pricedOffer.travelerPricings ?? null,
        validatingAirlineCode: pricedOffer.validatingAirlineCodes?.[0] ?? null,
        ticketingAgreement: pricedOffer.ticketingAgreement ?? null,
        ticketingDeadline: pricedOffer.ticketingAgreement?.dateTime
          ? new Date(pricedOffer.ticketingAgreement.dateTime)
          : null,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        specialRequests: dto.specialRequests ?? null,
        stripePaymentIntentId,
        stripeChargeId,
        paymentStatus: 'paid',
      };

      const savedFlight = await this.flightRepo.save(
        this.flightRepo.create(flightBookingData),
      );

      await this.bookingLogRepo.update(savedLog.id, {
        status: 'confirmed',
        stripePaymentIntentId,
      });

      this.sendFlightNotifications(user, savedFlight).catch((e) =>
        console.error('Flight notification error:', e),
      );

      return {
        message: 'Flight booking confirmed successfully',
        booking: savedFlight,
        priceBreakdown: {
          grandTotal,
          perPersonPrice,
          baseFare,
          taxes: totalTaxes,
          fees: totalFees,
          currency,
          travelerCount,
        },
        seatMap: seatMapData,
      };
    } catch (err) {
      const rawMessage = (err as Error).message || '';

      await this.bookingLogRepo.update(savedLog.id, {
        status: 'failed',
        failureReason: rawMessage,
      });

      if (stripePaymentIntentId && !rawMessage.includes('Payment failed')) {
        try {
          await this.stripe.refunds.create({ payment_intent: stripePaymentIntentId });
          console.log('Stripe refund issued for failed flight booking');
        } catch (refundErr) {
          console.error('Stripe refund failed:', (refundErr as Error).message);
        }
      }

      if (err instanceof HttpException || err instanceof BadRequestException) throw err;

      throw new HttpException(toUserFriendlyError(rawMessage), HttpStatus.BAD_REQUEST);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  PAYMENT METHOD MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  async addPaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.firstName
          ? `${user.firstName} ${user.lastName ?? ''}`.trim()
          : undefined,
        metadata: { userId: user.id },
      });
      user.stripeCustomerId = customer.id;
      await this.userRepo.save(user);
    }

    if (user.paymentMethodId) {
      try {
        await this.stripe.paymentMethods.detach(user.paymentMethodId);
      } catch {
        /* ignore */
      }
    }

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId!,
    });
    await this.stripe.customers.update(user.stripeCustomerId!, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    user.paymentMethodId = paymentMethodId;
    user.last4 = pm.card?.last4 ?? null;
    await this.userRepo.save(user);

    return {
      message: 'Payment method saved',
      paymentMethodId,
      last4: pm.card?.last4,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  BOOKING LOGS
  // ─────────────────────────────────────────────────────────────

  async getAllBookingLogs(
    page = 1,
    limit = 10,
    userId?: string,
    priceRange?: string,
    destination?: string,
    search?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const qb = this.bookingLogRepo
        .createQueryBuilder('log')
        .leftJoinAndSelect('log.hotelBooking', 'hotelBooking')
        .leftJoinAndSelect('log.flightBooking', 'flightBooking')
        .leftJoinAndSelect('log.user', 'user')
        .orderBy('log.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (userId) qb.andWhere('log.userId = :userId', { userId });

      if (search?.trim()) {
        const s = `%${search.trim()}%`;
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where('user.firstName ILIKE :s', { s })
              .orWhere('user.lastName ILIKE :s', { s })
              .orWhere('user.email ILIKE :s', { s })
              .orWhere("CONCAT(user.firstName, ' ', user.lastName) ILIKE :s", { s });
          }),
        );
      }

      qb.andWhere('log.status = :status', { status: 'confirmed' });

      if (destination?.trim()) {
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where('LOWER(hotelBooking.hotelName) LIKE LOWER(:dest)', {
                dest: `%${destination}%`,
              })
              .orWhere('LOWER(hotelBooking.destinationName) LIKE LOWER(:dest)', {
                dest: `%${destination}%`,
              })
              .orWhere('LOWER(flightBooking.departureAirport) LIKE LOWER(:dest)', {
                dest: `%${destination}%`,
              })
              .orWhere('LOWER(flightBooking.arrivalAirport) LIKE LOWER(:dest)', {
                dest: `%${destination}%`,
              });
          }),
        );
      }

      if (priceRange && priceRange !== 'all') {
        const ranges: Record<string, { min: number; max: number | null }> = {
          '0-1000': { min: 0, max: 1000 },
          '1000-5000': { min: 1000, max: 5000 },
          '5000-15000': { min: 5000, max: 15000 },
          '15000+': { min: 15000, max: null },
        };
        const range = ranges[priceRange];
        if (range) {
          qb.andWhere(
            new Brackets((sub) => {
              if (range.max !== null) {
                sub
                  .where('hotelBooking.totalPrice BETWEEN :min AND :max', {
                    min: range.min,
                    max: range.max,
                  })
                  .orWhere('flightBooking.ticketPrice BETWEEN :min AND :max', {
                    min: range.min,
                    max: range.max,
                  });
              } else {
                sub
                  .where('hotelBooking.totalPrice >= :min', { min: range.min })
                  .orWhere('flightBooking.ticketPrice >= :min', { min: range.min });
              }
            }),
          );
        }
      }

      const [logs, total] = await qb.getManyAndCount();

      return {
        data: logs.map((log) => ({
          id: log.id,
          user: log.user ?? null,
          bookingType: log.bookingType,
          status: log.status,
          totalAmount: log.totalAmount,
          currency: log.currency,
          stripePaymentIntentId: log.stripePaymentIntentId,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt,
          hotelBooking: log.hotelBooking ?? null,
          flightBooking: log.flightBooking ?? null,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          showing: logs.length,
          currentPage: page,
        },
      };
    } catch (error) {
      console.error('Error fetching booking logs:', error);
      throw new InternalServerErrorException(
        `Failed to fetch booking logs: ${(error as Error).message}`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  GET BY ID
  // ─────────────────────────────────────────────────────────────

  async getHotelById(hotelId: string) {
    try {
      const apiKey = this.configService.get<string>('HOTELBED_API_KEY')!;
      const secret = this.configService.get<string>('HOTELBED_SHARED_KEY')!;

      const res = await axios.get(
        `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels/${hotelId}`,
        {
          headers: {
            'Api-key': apiKey,
            'X-Signature': this.createSignature(apiKey, secret),
            Accept: 'application/json',
          },
          timeout: this.API_TIMEOUT,
        },
      );

      const hotel = res.data?.hotel;
      return {
        id: hotel.code,
        name: hotel.name?.content,
        description: hotel.description?.content,
        address: hotel.address?.content,
        postalCode: hotel.postalCode,
        city: hotel.city?.content,
        countryCode: hotel.countryCode,
        rating: hotel.categoryCode,
        categoryName: hotel.categoryName?.content,
        coordinates: hotel.coordinates,
        images:
          hotel.images?.map(
            (img: any) => `https://photos.hotelbeds.com/giata/${img.path}`,
          ) ?? [],
        facilities: hotel.facilities?.map((f: any) => f.name?.content),
        phones: hotel.phones,
        email: hotel.email,
        web: hotel.web,
        chainCode: hotel.chainCode,
        chainName: hotel.chainName?.content,
        boards: hotel.boards,
        rooms: hotel.rooms,
        amenities: hotel.amenities,
        interestPoints: hotel.interestPoints,
        issues: hotel.issues,
      };
    } catch (error) {
      this.handleApiError(error, 'Hotelbeds');
    }
  }

  async getFlightById(orderId: string) {
    try {
      const accessToken = await this.getAmadeusToken();
      const res = await axios.get(
        `https://test.api.amadeus.com/v1/booking/flight-orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: this.API_TIMEOUT,
        },
      );
      return res.data?.data;
    } catch (error) {
      this.handleApiError(error, 'Amadeus');
    }
  }

  async getFlightSeatMap(flightOfferBody: any) {
    try {
      const accessToken = await this.getAmadeusToken();
      return await this.getSeatMap(accessToken, flightOfferBody);
    } catch (error) {
      this.handleApiError(error, 'Amadeus SeatMap');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  PUBLIC AVAILABILITY CHECKS
  // ─────────────────────────────────────────────────────────────

  async checkHotelRatePublic(rateKey: string) {
    if (!rateKey?.trim()) throw new BadRequestException('rateKey is required');

    const data = await this.checkRateAvailability(rateKey);
    if (!data) {
      throw new HttpException(
        'This room is no longer available. Please search again.',
        HttpStatus.GONE,
      );
    }

    const rate = data.rooms?.[0]?.rates?.[0];
    return {
      available: true,
      confirmedPrice: Number(rate?.net ?? data.totalNet ?? 0),
      sellingRate: Number(rate?.sellingRate ?? 0),
      currency: data.currency ?? 'EUR',
      cancellationPolicies: rate?.cancellationPolicies ?? [],
      paymentType: rate?.paymentType ?? null,
      boardName: rate?.boardName ?? null,
      boardCode: rate?.boardCode ?? null,
      rateType: rate?.rateType ?? null,
      rateComments: rate?.rateComments ?? null,
      taxes: rate?.taxes ?? null,
      allotment: rate?.allotment ?? null,
      commission: rate?.commission ?? null,
      dailyRates: rate?.dailyRates ?? null,
    };
  }

  async checkFlightOfferPublic(flightOffer: any) {
    if (!flightOffer) throw new BadRequestException('flightOffer is required');

    try {
      const accessToken = await this.getAmadeusToken();
      const pricedOffer = await this.priceFlightOffer(accessToken, flightOffer);
      return {
        available: true,
        confirmedPrice: Number(pricedOffer.price?.grandTotal ?? 0),
        currency: pricedOffer.price?.currency ?? 'USD',
        validatingAirlineCodes: pricedOffer.validatingAirlineCodes ?? [],
        itineraries: pricedOffer.itineraries ?? [],
        travelerPricings: pricedOffer.travelerPricings ?? [],
        pricedOffer,
      };
    } catch {
      throw new HttpException(
        'This flight is no longer available. Please search again.',
        HttpStatus.GONE,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  HOTELBEDS HELPERS
  // ─────────────────────────────────────────────────────────────

  private async checkRateAvailability(rateKey: string): Promise<any | null> {
    const apiKey = this.configService.get<string>('HOTELBED_API_KEY')!;
    const secret = this.configService.get<string>('HOTELBED_SHARED_KEY')!;

    try {
      const res = await axios.post(
        'https://api.test.hotelbeds.com/hotel-api/1.0/checkrates',
        { rooms: [{ rateKey }] },
        {
          headers: {
            'Api-key': apiKey,
            'X-Signature': this.createSignature(apiKey, secret),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: this.API_TIMEOUT,
        },
      );
      return res.data.hotel ?? null;
    } catch (error) {
      console.error(
        'Rate check error:',
        (error as any).response?.data || (error as Error).message,
      );
      return null;
    }
  }

  private async bookWithHotelbeds(dto: CreateHotelBookingDto, user: User): Promise<any> {
    const apiKey = this.configService.get<string>('HOTELBED_API_KEY')!;
    const secret = this.configService.get<string>('HOTELBED_SHARED_KEY')!;

    const paxes = [
      { roomId: 1, type: 'AD', name: dto.holderName, surname: dto.holderSurname },
      ...Array.from({ length: Math.max(0, dto.adults - 1) }).map(() => ({
        roomId: 1,
        type: 'AD',
        name: dto.holderName,
        surname: dto.holderSurname,
      })),
      ...Array.from({ length: dto.children }).map((_, i) => ({
        roomId: 1,
        type: 'CH',
        name: dto.holderName,
        surname: dto.holderSurname,
        age: dto.childrenAges?.[i] ?? 10,
      })),
    ];

    const payload = {
      holder: {
        name: dto.holderName,
        surname: dto.holderSurname,
        email: dto.holderEmail,
      },
      rooms: [{ rateKey: dto.rateKey, paxes }],
      clientReference: `BHTL${Date.now().toString().slice(-10)}`,
      remark: dto.remark ?? 'Booking via Bookd',
    };

    try {
      const res = await axios.post(
        'https://api.test.hotelbeds.com/hotel-api/1.0/bookings',
        payload,
        {
          headers: {
            'Api-key': apiKey,
            'X-Signature': this.createSignature(apiKey, secret),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: this.API_TIMEOUT,
        },
      );
      return res.data.booking;
    } catch (error: any) {
      if (error.response?.status === 410) {
        throw new HttpException(
          'This room is no longer available. Please search again.',
          HttpStatus.GONE,
        );
      }
      const msg =
        error.response?.data?.error?.message ?? 'Hotelbeds booking failed';
      throw new Error(msg);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  AMADEUS HELPERS
  // ─────────────────────────────────────────────────────────────

  private async getAmadeusToken(): Promise<string> {
    const clientId = this.configService.get<string>('AMADEUS_API_KEY')!;
    const clientSecret = this.configService.get<string>('AMADEUS_API_SECRET')!;

    const res = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      { timeout: this.API_TIMEOUT },
    );
    return res.data.access_token;
  }

  private async priceFlightOffer(accessToken: string, flightOffer: any): Promise<any> {
    const res = await axios.post(
      'https://test.api.amadeus.com/v1/shopping/flight-offers/pricing',
      { data: { type: 'flight-offers-pricing', flightOffers: [flightOffer] } },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: this.API_TIMEOUT,
      },
    );
    const priced = res.data?.data?.flightOffers?.[0];
    if (!priced) throw new Error('Unable to price flight offer');
    return priced;
  }

  private async getSeatMap(accessToken: string, flightOffer: any): Promise<any[]> {
    const res = await axios.post(
      'https://test.api.amadeus.com/v1/shopping/seatmaps',
      { data: [flightOffer] },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: this.API_TIMEOUT,
      },
    );
    return res.data?.data ?? [];
  }

  private async createAmadeusFlightOrder(
    accessToken: string,
    pricedOffer: any,
    dto: any,
  ): Promise<any> {
    const sanitiseName = (raw: string): string =>
      raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z ]/g, '')
        .trim()
        .substring(0, 29);

    const toISODate = (raw: string): string => {
      if (!raw) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toISOString().split('T')[0];
    };

    const phone = parsePhone(dto.contactPhone);
    const safePhone = {
      countryCallingCode: phone.countryCallingCode
        .replace(/\D/g, '')
        .substring(0, 3) || '1',
      number: phone.number.replace(/\D/g, '').substring(0, 25),
    };
    if (safePhone.number.length < 5) {
      safePhone.countryCallingCode = '1';
      safePhone.number = dto.contactPhone.replace(/\D/g, '').substring(0, 25);
    }

    // Use the exact travelerPricing IDs Amadeus assigned in /pricing response.
    // These must match 1:1 with the travelers array we send in the flight-order.
    const pricedTravelerIds: string[] =
      pricedOffer.travelerPricings?.map((tp: any) => String(tp.travelerId)) ?? [];

    const travelers = dto.travelers.map((t: any, index: number) => {
      // Use Amadeus-assigned travelerId from pricedOffer, NOT sequential index
      const amadeusTravelerId = pricedTravelerIds[index] ?? String(index + 1);
      const first = sanitiseName(t.firstName);
      const last = sanitiseName(t.lastName);

      const traveler: any = {
        id: amadeusTravelerId,
        dateOfBirth: toISODate(t.dateOfBirth),
        name: {
          firstName: first || 'TRAVELER',
          lastName: last || 'UNKNOWN',
        },
        gender: t.gender,
        contact: {
          emailAddress: dto.contactEmail.toLowerCase().trim(),
          phones: [
            {
              deviceType: 'MOBILE',
              countryCallingCode: safePhone.countryCallingCode,
              number: safePhone.number,
            },
          ],
        },
      };

      // Passport required for ADULT travelers
      if (t.type === 'ADULT') {
        const issuance = (
          t.passportIssuingCountry ||
          t.nationality ||
          ''
        )
          .toUpperCase()
          .trim();
        const nat = (t.nationality || '').toUpperCase().trim();
        traveler.documents = [
          {
            documentType: 'PASSPORT',
            number: (t.passportNumber || '').toUpperCase().replace(/\s/g, ''),
            expiryDate: toISODate(t.passportExpiry),
            issuanceCountry: issuance || nat,
            validityCountry: nat || issuance,
            nationality: nat || issuance,
            holder: true,
          },
        ];
      }

      return traveler;
    });

    console.log(
      `[Amadeus flight-order] ${travelers.length} traveler(s), IDs: [${travelers
        .map((t: any) => t.id)
        .join(', ')}]`,
    );

    const nameParts = dto.contactName.trim().split(/\s+/);
    const street = (dto.contactAddress?.street ?? '').trim() || 'N/A';
    const city = (dto.contactAddress?.city ?? '').trim() || 'N/A';
    const postalCode = (dto.contactAddress?.postalCode ?? '').trim();
    const countryCode = (dto.contactAddress?.countryCode ?? '')
      .toUpperCase()
      .trim();
    const remarksText = (dto.specialRequests ?? 'Booking via Bookd')
      .replace(/[^\x20-\x7E]/g, '')
      .substring(0, 127)
      .trim() || 'Booking via Bookd';

    const payload = {
      data: {
        type: 'flight-order',
        flightOffers: [pricedOffer],
        travelers,
        remarks: {
          general: [
            { subType: 'GENERAL_MISCELLANEOUS', text: remarksText },
          ],
        },
        ticketingAgreement: { option: 'DELAY_TO_CANCEL', delay: '6D' },
        contacts: [
          {
            addresseeName: {
              firstName: sanitiseName(nameParts[0] ?? 'CONTACT'),
              lastName: sanitiseName(
                (nameParts.slice(1).join(' ') || nameParts[0]) ?? 'CONTACT',
              ),
            },
            companyName: 'Bookd',
            purpose: 'STANDARD',
            phones: [
              {
                deviceType: 'MOBILE',
                countryCallingCode: safePhone.countryCallingCode,
                number: safePhone.number,
              },
            ],
            emailAddress: dto.contactEmail.toLowerCase().trim(),
            address: {
              lines: [street],
              cityName: city,
              ...(postalCode ? { postalCode } : {}),
              ...(countryCode ? { countryCode } : {}),
            },
          },
        ],
      },
    };

    try {
      const res = await axios.post(
        'https://test.api.amadeus.com/v1/booking/flight-orders',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: this.API_TIMEOUT,
        },
      );
      return res.data;
    } catch (error: any) {
      const amadeusErrors: any[] = error.response?.data?.errors ?? [];
      console.error(
        'Amadeus flight-order error:',
        JSON.stringify(error.response?.data, null, 2),
      );
      const rawDetail =
        amadeusErrors
          .map((e: any) => e.detail ?? e.title)
          .filter(Boolean)
          .join('; ') ||
        error.response?.data?.title ||
        'Amadeus booking failed';
      throw new Error(`Amadeus error: ${rawDetail}`);
    }
  }

  private extractSeatAssignments(
    orderData: any,
    preferences?: CreateFlightBookingDto['seatPreferences'],
  ) {
    if (!preferences?.length) return [];
    const segments =
      orderData?.flightOffers?.[0]?.itineraries?.[0]?.segments ?? [];
    return preferences.map((pref, i) => ({
      travelerId: pref.travelerId,
      segmentId: pref.segmentId ?? segments[0]?.id ?? String(i),
      seatNumber: null,
      seatType: pref.seatType ?? 'NO_PREFERENCE',
    }));
  }

  // ─────────────────────────────────────────────────────────────
  //  STRIPE HELPERS
  // ─────────────────────────────────────────────────────────────

  private async ensureStripeCustomer(user: User, incomingPaymentMethodId?: string) {
    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.firstName
          ? `${user.firstName} ${user.lastName ?? ''}`.trim()
          : undefined,
        metadata: { userId: user.id },
      });
      user.stripeCustomerId = customer.id;
      await this.userRepo.save(user);
    }

    if (incomingPaymentMethodId) {
      await this.addPaymentMethod(user.id, incomingPaymentMethodId);
      const refreshed = await this.userRepo.findOne({ where: { id: user.id } });
      if (refreshed) {
        user.paymentMethodId = refreshed.paymentMethodId;
        user.stripeCustomerId = refreshed.stripeCustomerId;
        user.last4 = refreshed.last4;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────

  private async sendHotelNotifications(
    user: User,
    hotel: HotelBooking,
    reference: string,
  ) {
    const sub = (user as any).subscription;
    const name = user.firstName ?? 'Guest';

    if (sub?.plan?.smsReminder && user.phone) {
      try {
        await this.smsService.sendSms(
          user.phone,
          `Hi ${name}, your hotel booking at ${hotel.hotelName} is confirmed! Check-in: ${hotel.checkInDate?.toLocaleDateString()}. Ref: ${reference}. – Bookd`,
        );
      } catch (e) {
        console.error('Hotel SMS error:', (e as Error).message);
      }
    }

    if (sub?.plan?.calendarReminder) {
      try {
        const connected = await this.calendarService.isCalendarConnected(user.id);
        if (connected) {
          await this.calendarService.createEvent(user.id, {
            summary: `🏨 Hotel: ${hotel.hotelName}`,
            description:
              `Booking Ref: ${reference}\nRoom: ${hotel.roomType}\nBoard: ${hotel.boardName}\n` +
              `Guests: ${hotel.adults} adult(s)${hotel.children ? `, ${hotel.children} child(ren)` : ''}\nConfirmation: ${reference}`,
            location: [hotel.address, hotel.city, hotel.countryCode]
              .filter(Boolean)
              .join(', '),
            start: { dateTime: hotel.checkInDate.toISOString() },
            end: { dateTime: hotel.checkOutDate.toISOString() },
            reminders: { useDefault: true },
          });
        }
      } catch (e) {
        console.error('Hotel calendar error:', (e as Error).message);
      }
    }

    if (sub?.plan?.emailReminder) {
      try {
        const html = hotelBookingTemplate(name, {
          ...hotel,
          bookingReference: reference,
        });
        await this.mailService.sendEmail(
          user.email,
          `Hotel Booking Confirmed – ${hotel.hotelName} – Bookd`,
          html,
        );
      } catch (e) {
        console.error('Hotel email error:', (e as Error).message);
      }
    }
  }

  private async sendFlightNotifications(user: User, flight: FlightBooking) {
    const sub = (user as any).subscription;
    const name = user.firstName ?? 'Guest';

    if (sub?.plan?.smsReminder && user.phone) {
      try {
        await this.smsService.sendSms(
          user.phone,
          `Hi ${name}, your flight ${flight.flightNumber} (${flight.departureAirport} → ${flight.arrivalAirport}) is confirmed! PNR: ${flight.pnr}. – Bookd`,
        );
      } catch (e) {
        console.error('Flight SMS error:', (e as Error).message);
      }
    }

    if (sub?.plan?.calendarReminder) {
      try {
        const connected = await this.calendarService.isCalendarConnected(user.id);
        if (connected) {
          await this.calendarService.createEvent(user.id, {
            summary: `✈️ Flight ${flight.flightNumber}: ${flight.departureAirport} → ${flight.arrivalAirport}`,
            description: `PNR: ${flight.pnr}\nClass: ${flight.travelClass}\nAirline: ${flight.airlineName}`,
            start: { dateTime: flight.departureTime.toISOString() },
            end: { dateTime: flight.arrivalTime.toISOString() },
            reminders: { useDefault: true },
          });
        }
      } catch (e) {
        console.error('Flight calendar error:', (e as Error).message);
      }
    }

    if (sub?.plan?.emailReminder) {
      try {
        const html = flightBookingTemplate(name, flight);
        await this.mailService.sendEmail(
          user.email,
          `Flight Booking Confirmed – ${flight.flightNumber} – Bookd`,
          html,
        );
      } catch (e) {
        console.error('Flight email error:', (e as Error).message);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  UTILITIES
  // ─────────────────────────────────────────────────────────────

  private async getUserWithSubscription(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { subscription: { plan: true } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private createSignature(apiKey: string, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return crypto
      .createHash('sha256')
      .update(`${apiKey}${secret}${timestamp}`)
      .digest('hex');
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    return Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000,
    );
  }

  private extractFreeCancellationDeadline(policies: any[]): Date | null {
    if (!policies?.length) return null;
    const sorted = [...policies].sort(
      (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
    );
    const firstPenalty = sorted.find((p) => Number(p.amount ?? 0) > 0);
    if (firstPenalty?.from) return new Date(firstPenalty.from);
    return null;
  }

  private handleApiError(error: unknown, api: string): never {
    if (axios.isAxiosError(error)) {
      console.error(`${api} API Error:`, (error as AxiosError).response?.data);
    }
    throw new InternalServerErrorException(`Failed to fetch ${api} details`);
  }
}