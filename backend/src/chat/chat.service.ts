import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatPreview } from './entities/chat-preview.entity';
import { User } from '../user/entities/user.entity';
import { ChatMessageDto } from './dto/create-chat.dto';
import OpenAI from 'openai';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { BOOKD_TRAVEL_PROMPT } from './prompts/system.prompts';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend((utc as any).default ?? utc);
dayjs.extend((timezone as any).default ?? timezone);
dayjs.extend((isSameOrBefore as any).default ?? isSameOrBefore);
dayjs.extend((isSameOrAfter as any).default ?? isSameOrAfter);

interface ParsedIntent {
  intent: 'hotel_search' | 'flight_search' | 'tourism_info' | 'talk_to_agent';
  [key: string]: any;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private readonly MAX_CHAT_HISTORY = 15;
  private readonly FUTURE_DATE_LIMIT_MONTHS = 6;
  private readonly HOTEL_RESULT_LIMIT = 10;
  private readonly FLIGHT_RESULT_LIMIT = 10;
  private readonly API_TIMEOUT = 15000;

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(ChatPreview)
    private readonly chatPreviewRepository: Repository<ChatPreview>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processPrompt(dto: ChatMessageDto, userId: string, timezone: any): Promise<any> {
    try {
      const { prompt, threadId } = dto;

      if (!prompt?.trim()) {
        throw new BadRequestException('Prompt cannot be empty');
      }

      if (!threadId?.trim()) {
        throw new BadRequestException('Thread ID is required');
      }

      const user = await this.getUserWithSubscription(userId);
      const { subscription } = user;

      const userTz = this.validateAndSetTimezone(timezone, user);

      await this.updateChatPreview(user, threadId, prompt);

      const usageCheck = await this.checkUsageLimit(userId, subscription);
      if (!usageCheck.allowed) {
        return this.createLimitResponse();
      }

      const chatHistory = await this.getChatHistory(userId, threadId);

      const { responseText, parsedData } = await this.generateAIResponse(
        prompt,
        chatHistory,
        userTz,
      );
      console.log('parsedData', parsedData);

      // ── Date validation uses userTz so "today" is always the user's local today
      const dateValidation: any = this.validateDates(parsedData, userTz);
      if (!dateValidation.valid) {
        await this.saveChat(user, threadId, prompt, dateValidation.message, null, [], []);
        return {
          message: dateValidation.message,
          hotelRecord: [],
          flightRecord: [],
        };
      }

      const normalizedIntents = this.normalizeIntents(parsedData, userTz, subscription);
      console.log('normalizedIntents', normalizedIntents);

      const { hotels, flights, agentRequest }: any = await this.fetchTravelData(
        normalizedIntents,
        userTz,
      );

      const emptyResultsCheck: any = this.handleEmptyResults(normalizedIntents, hotels, flights);
      if (emptyResultsCheck.shouldReturn) {
        await this.saveChat(user, threadId, prompt, emptyResultsCheck.message, parsedData, [], []);
        return {
          message: emptyResultsCheck.message,
          hotelRecord: [],
          flightRecord: [],
        };
      }

      const savedChat = await this.saveChat(
        user,
        threadId,
        prompt,
        responseText,
        parsedData,
        flights,
        hotels,
      );

      return {
        ...savedChat,
        hotelRecord: hotels || [],
        flightRecord: flights || [],
        agentRequest,
      };
    } catch (error) {
      console.error('❌ Error in processPrompt:', error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to process your request: ${error.message || 'Unknown error'}`,
      );
    }
  }

  private async getUserWithSubscription(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        subscription: {
          plan: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.subscription || !user.subscription.plan) {
      throw new BadRequestException('No active subscription found');
    }

    return user;
  }

  private validateAndSetTimezone(timezone: string, user: User): string {
    const supportedTimezones = Intl.supportedValuesOf('timeZone');
    const userTz = supportedTimezones.includes(timezone)
      ? timezone
      : user.timezone || 'UTC';

    if (!user.timezone && timezone && supportedTimezones.includes(timezone)) {
      user.timezone = userTz;
      this.userRepository.save(user).catch(err =>
        console.error('Failed to update user timezone:', err)
      );
    }

    return userTz;
  }

  private async updateChatPreview(user: User, threadId: string, prompt: string) {
    try {
      let chatPreview = await this.chatPreviewRepository.findOne({
        where: {
          user: { id: user.id },
          threadId,
        },
      });

      if (!chatPreview) {
        chatPreview = this.chatPreviewRepository.create({
          user,
          threadId,
          title: prompt.slice(0, 40),
        });
      }

      chatPreview.updatedAt = new Date();
      await this.chatPreviewRepository.save(chatPreview);
    } catch (error) {
      console.error('Failed to update chat preview:', error);
    }
  }

  private async checkUsageLimit(userId: string, subscription: any) {
    try {
      const usedQueries = await this.chatRepository.count({
        where: {
          user: { id: userId },
          createdAt: Between(
            subscription.currentPeriodStart,
            subscription.currentPeriodEnd,
          ),
        },
      });

      const limit = subscription.plan.aiQueryLimit;
      const allowed = limit === null || usedQueries < limit;

      return { allowed, usedQueries, limit };
    } catch (error) {
      console.error('Failed to check usage limit:', error);
      return { allowed: true, usedQueries: 0, limit: null };
    }
  }

  private createLimitResponse(): any {
    return {
      message: 'You have reached your AI usage limit for the current billing period.',
      hotelRecord: [],
      flightRecord: [],
    };
  }

  private async getChatHistory(userId: string, threadId: string) {
    try {
      const chatHistory = await this.chatRepository.find({
        where: { user: { id: userId }, threadId },
        order: { createdAt: 'ASC' },
      });

      return chatHistory.slice(-this.MAX_CHAT_HISTORY);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return [];
    }
  }

  private async generateAIResponse(
    prompt: string,
    chatHistory: Chat[],
    userTz: string,
  ) {
    try {
      const today = dayjs().tz(userTz).format('YYYY-MM-DD');
      const systemPrompt = BOOKD_TRAVEL_PROMPT;

      const messages: any[] = [
        {
          role: 'system',
          content: `
User timezone: ${userTz}. Current local date: ${today}.
IMPORTANT: 
- When the user provides any travel-related date (checkIn, checkOut, departureDate, returnDate), 
  it may be in natural language like "tomorrow", "next Monday", or "in 3 days".
- You must first convert these relative dates into actual YYYY-MM-DD dates **in the user's timezone**.
- After conversion, if the date is earlier than the current local date (${today}), respond politely:
  "The date you provided has already passed. Please provide a future date."
- Do NOT try to guess or change the date automatically. Only convert natural language into proper dates for validation.
`,
        },
        { role: 'system', content: systemPrompt },
        ...chatHistory.flatMap(chat => [
          { role: 'user', content: chat.prompt },
          { role: 'assistant', content: chat.response },
        ]),
        { role: 'user', content: prompt },
      ];

      const chatResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      let responseText = chatResponse.choices?.[0]?.message?.content || 'No response generated.';
      responseText = responseText.replace(/```html|```/g, '').trim();

      const parsedData = this.extractJSON(responseText);
      responseText = responseText.replace(/<!--[\s\S]*?-->/g, '').trim();

      return { responseText, parsedData };
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      throw new InternalServerErrorException('Failed to generate AI response');
    }
  }

  private extractJSON(text: string): any {
    try {
      const jsonMatch = text.match(/<!--([\s\S]*?)-->/);
      if (jsonMatch?.[1]) {
        const parsed = JSON.parse(jsonMatch[1].trim());
        console.log('🧠 Parsed JSON:', JSON.stringify(parsed, null, 2));
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('❌ JSON parse error:', error.message);
      return null;
    }
  }

  private validateDates(parsedData: any, userTz: string) {
    if (!parsedData) {
      return { valid: true };
    }

    // "today" = midnight at the start of the current day in the user's timezone.
    // We use startOf('day') so that today's date is always valid.
    const todayInUserTz    = dayjs().tz(userTz).startOf('day');
    const maxFutureDate    = todayInUserTz.add(this.FUTURE_DATE_LIMIT_MONTHS, 'month');

    const intentsToCheck = Array.isArray(parsedData.intents)
      ? parsedData.intents
      : [parsedData];

    for (const intent of intentsToCheck) {
      const dateFields = [
        intent.checkIn,
        intent.checkOut,
        intent.departureDate,
        intent.returnDate,
      ].filter(Boolean);

      for (const dateStr of dateFields) {
        // ── Normalize to explicit local midnight before parsing ──
        // dayjs.tz('2026-02-28', tz) has a known ambiguity in some plugin
        // versions — it can silently fall back to UTC parsing, making the
        // date appear one day earlier for UTC+ users.
        // Appending 'T00:00:00' forces dayjs to treat it as local midnight,
        // which is what we always want for a date-only comparison.
        const normalizedStr = /T\d{2}:\d{2}/.test(dateStr)
          ? dateStr                         // already has a time component
          : `${dateStr}T00:00:00`;          // bare YYYY-MM-DD → add midnight

        const date = dayjs.tz(normalizedStr, userTz);

        // Debug log — remove once confirmed working
        console.log(
          `[validateDates] input="${dateStr}" normalized="${normalizedStr}" ` +
          `parsed=${date.format()} today=${todayInUserTz.format()} tz=${userTz}`,
        );

        if (!date.isValid()) {
          return {
            valid: false,
            message: `Invalid date format: ${dateStr}. Please provide a valid date.`,
          };
        }

        // isBefore(..., 'day'): only rejects dates strictly before today.
        // A date equal to today (same calendar day) is allowed.
        if (date.isBefore(todayInUserTz, 'day')) {
          return {
            valid: false,
            message: 'The date you provided has already passed. Please provide a future date.',
          };
        }

        if (date.isAfter(maxFutureDate, 'day')) {
          return {
            valid: false,
            message: `The date you provided is more than ${this.FUTURE_DATE_LIMIT_MONTHS} months ahead. Please provide a date within the next ${this.FUTURE_DATE_LIMIT_MONTHS} months.`,
          };
        }
      }
    }

    return { valid: true };
  }

  private normalizeIntents(parsedData: any, userTz: string, subscription: any) {
    if (!parsedData) {
      return null;
    }

    const allowHotel = subscription.plan.hotelBooking;
    const allowFlight = subscription.plan.flightBooking;

    let intents = Array.isArray(parsedData.intents)
      ? parsedData.intents
      : [parsedData];

    intents = intents.filter(intent => {
      if (intent.intent === 'hotel_search' && !allowHotel) return false;
      if (intent.intent === 'flight_search' && !allowFlight) return false;
      return true;
    });

    intents = intents.map(intent => this.normalizeFutureDates(intent, userTz));

    return { intents };
  }

  private normalizeFutureDates(intent: any, userTz: string) {
    // ── This method is now a safety net only ──────────────────
    // validateDates already rejects past dates before we reach here,
    // so we should rarely (never) need to add a year. The +1 year
    // logic is kept as a last-resort fallback for edge cases but
    // will not fire for valid future dates.
    const now = dayjs().tz(userTz).startOf('day');

    if (intent.intent === 'flight_search') {
      if (intent.departureDate) {
        let dep = dayjs.tz(intent.departureDate, userTz);

        // Fallback: only shift if somehow still in the past after validation
        if (dep.isBefore(now, 'day')) {
          dep = dep.add(1, 'year');
          console.warn(
            `[normalizeFutureDates] departureDate ${intent.departureDate} was in the past — shifted to ${dep.format('YYYY-MM-DD')}`,
          );
        }

        intent.departureDate = dep.format('YYYY-MM-DD');

        if (intent.returnDate) {
          let ret = dayjs.tz(intent.returnDate, userTz);

          if (!ret.isAfter(dep, 'day')) {
            ret = dep.add(3, 'day');
          }

          intent.returnDate = ret.format('YYYY-MM-DD');
        }
      }
    }

    if (intent.intent === 'hotel_search') {
      if (intent.checkIn) {
        let checkIn = dayjs.tz(intent.checkIn, userTz);

        if (checkIn.isBefore(now, 'day')) {
          checkIn = checkIn.add(1, 'year');
          console.warn(
            `[normalizeFutureDates] checkIn ${intent.checkIn} was in the past — shifted to ${checkIn.format('YYYY-MM-DD')}`,
          );
        }

        intent.checkIn = checkIn.format('YYYY-MM-DD');
      }

      if (intent.checkOut) {
        let checkOut = dayjs.tz(intent.checkOut, userTz);
        const checkInDate = dayjs.tz(intent.checkIn, userTz);

        if (!checkOut.isAfter(checkInDate, 'day')) {
          checkOut = checkInDate.add(2, 'day');
        }

        intent.checkOut = checkOut.format('YYYY-MM-DD');
      }
    }

    return intent;
  }

  private async fetchTravelData(parsedData: any, userTz: string) {
    const hotels: any[] = [];
    const flights: any[] = [];
    let agentRequest = false;

    if (!parsedData?.intents?.length) {
      return { hotels, flights, agentRequest };
    }

    const fetchPromises = parsedData.intents.map(async (intent: ParsedIntent) => {
      if (intent.intent === 'hotel_search' && intent.city) {
        try {
          const hotelResults = await this.fetchHotelsByCity(
            intent.city,
            intent.destinationCode,
            intent.checkIn,
            intent.checkOut,
            intent.adults || 1,
            intent.children || 0,
            intent.rooms || 1,
            userTz,
            intent.budget,
          );
          hotels.push(...hotelResults);
        } catch (error) {
          console.error('🏨 Hotel fetch error:', error.message);
        }
      }

      if (
        intent.intent === 'flight_search' &&
        intent.origin &&
        intent.destination &&
        intent.departureDate
      ) {
        try {
          const flightResults = await this.fetchFlights(
            intent.origin,
            intent.destination,
            intent.departureDate,
            intent.returnDate,
            intent.adults || 1,
            intent.travelClass || 'ECONOMY',
            intent.currency || 'USD',
            intent.budget,
          );
          flights.push(...flightResults);
        } catch (error) {
          console.error('✈️ Flight fetch error:', error.message);
        }
      }

      if (intent.intent === 'talk_to_agent') {
        agentRequest = true;
      }
    });

    await Promise.all(fetchPromises);

    return { hotels, flights, agentRequest };
  }

  private handleEmptyResults(parsedData: any, hotels: any[], flights: any[]) {
    if (!parsedData?.intents?.length) {
      return { shouldReturn: false };
    }

    let hasHotelIntent = false;
    let hasFlightIntent = false;

    for (const intent of parsedData.intents) {
      if (intent.intent === 'hotel_search') hasHotelIntent = true;
      if (intent.intent === 'flight_search') hasFlightIntent = true;
    }

    if (hasHotelIntent && hasFlightIntent && hotels.length === 0 && flights.length === 0) {
      return {
        shouldReturn: true,
        message: "Apologies, we couldn't find any flights or hotels matching your request.",
      };
    }

    if (hasHotelIntent && !hasFlightIntent && hotels.length === 0) {
      return {
        shouldReturn: true,
        message: "Apologies, we couldn't find any hotels matching your request.",
      };
    }

    if (hasFlightIntent && !hasHotelIntent && flights.length === 0) {
      return {
        shouldReturn: true,
        message: "Apologies, we couldn't find any flights matching your request.",
      };
    }

    return { shouldReturn: false };
  }

  private async saveChat(
    user: User,
    threadId: string,
    prompt: string,
    response: string,
    parsedIntent: any,
    flights: any[],
    hotels: any[],
  ) {
    try {
      const chat = this.chatRepository.create({
        prompt,
        response,
        threadId,
        parsedIntent,
        user,
        flightRecord: flights,
        hotelRecord: hotels,
      });

      return await this.chatRepository.save(chat);
    } catch (error) {
      console.error('Failed to save chat:', error);
      throw new InternalServerErrorException('Failed to save chat message');
    }
  }

  private createSignature(apiKey: string, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return crypto
      .createHash('sha256')
      .update(`${apiKey}${secret}${timestamp}`)
      .digest('hex');
  }

  private async fetchHotelsByCity(
    city: string,
    destinationCode: string,
    checkIn?: string,
    checkOut?: string,
    adults = 1,
    children = 0,
    rooms = 1,
    timezone = 'UTC',
    budget?: { min?: number; max?: number; currency?: string },
  ) {
    try {
      const apiKey = this.configService.get<string>('HOTELBED_API_KEY');
      const secret = this.configService.get<string>('HOTELBED_SHARED_KEY');

      if (!apiKey || !secret) {
        throw new Error('Missing Hotelbeds credentials');
      }

      const today = dayjs().tz(timezone);
      const finalCheckIn = checkIn || today.format('YYYY-MM-DD');
      const finalCheckOut = checkOut || today.add(2, 'day').format('YYYY-MM-DD');

      const budgetMin = budget?.min ?? null;
      const budgetMax = budget?.max ?? null;

      const availabilityBody = {
        stay: {
          checkIn: finalCheckIn,
          checkOut: finalCheckOut,
        },
        occupancies: [
          {
            rooms,
            adults,
            children,
            paxes: [
              ...Array.from({ length: adults }, () => ({ type: 'AD', age: 30 })),
              ...Array.from({ length: children }, () => ({ type: 'CH', age: 7 })),
            ],
          },
        ],
        destination: { code: destinationCode },
      };

      const availabilityRes = await axios.post(
        'https://api.test.hotelbeds.com/hotel-api/1.0/hotels',
        availabilityBody,
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

      const hotels = availabilityRes.data?.hotels?.hotels ?? [];

      const parsedHotels = hotels
        .filter((h: any) => ['4 STARS', '5 STARS'].includes(h.categoryName?.toUpperCase()))
        .map((h: any) => {
          const allRates = h.rooms?.flatMap((r: any) => r.rates) ?? [];
          if (!allRates.length) return null;

          const bestRate = allRates.sort((a: any, b: any) => {
            const priceA = Number(a.sellingRate ?? a.net ?? 0);
            const priceB = Number(b.sellingRate ?? b.net ?? 0);
            return priceA - priceB;
          })[0];

          const displayPrice = Number(bestRate.sellingRate ?? bestRate.net ?? 0);
          const netPrice = Number(bestRate.net ?? 0);

          if (budgetMin !== null && displayPrice < budgetMin) return null;
          if (budgetMax !== null && displayPrice > budgetMax) return null;

          return {
            hotelId: h.code,
            name: h.name,
            category: h.categoryName,
            rating: h.categoryName.includes('5') ? 5 : 4,
            destinationName: h.destinationName,
            zoneName: h.zoneName,
            coordinates: h.coordinates,
            price: displayPrice,
            netPrice,
            totalPrice: displayPrice,
            currency: h.currency,
            rateKey: bestRate.rateKey,
            rateType: bestRate.rateType,
            boardName: bestRate.boardName,
            boardCode: bestRate.boardCode,
            paymentType: bestRate.paymentType ?? null,
            cancellationPolicies: bestRate.cancellationPolicies ?? [],
            adults,
            children,
            rooms,
          };
        })
        .filter(Boolean);

      const topHotels = parsedHotels
        .sort((a, b) => b.rating - a.rating || a.price - b.price)
        .slice(0, 10);

      const hotelsWithContent = await Promise.all(
        topHotels.map(async (hotel: any) => {
          try {
            const contentRes = await axios.get(
              `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels/${hotel.hotelId}`,
              {
                headers: {
                  'Api-key': apiKey,
                  'X-Signature': this.createSignature(apiKey, secret),
                  Accept: 'application/json',
                },
                timeout: this.API_TIMEOUT,
              },
            );

            const info = contentRes.data?.hotel;

            return {
              ...hotel,
              description: info?.description?.content ?? 'No description available',
              address: info?.address?.content ?? 'Address not available',
              images:
                info?.images?.slice(0, 7).map(
                  (img: any) => `https://photos.hotelbeds.com/giata/${img.path}`,
                ) ?? [],
            };
          } catch (error) {
            console.error(`Failed to fetch content for hotel ${hotel.hotelId}:`, error.message);
            return hotel;
          }
        }),
      );

      console.log(`✅ Found ${hotelsWithContent.length} hotels for ${city}`);
      return hotelsWithContent;
    } catch (error) {
      this.handleAPIError(error, 'Hotelbeds');
      return [];
    }
  }

  private async fetchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate: string | null,
    adults = 1,
    travelClass = 'ECONOMY',
    currency = 'USD',
    budget?: { min?: number; max?: number; currency?: string },
  ) {
    try {
      const clientId = this.configService.get<string>('AMADEUS_API_KEY');
      const clientSecret = this.configService.get<string>('AMADEUS_API_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Missing Amadeus API credentials');
      }

      const budgetMin = budget?.min ?? null;
      const budgetMax = budget?.max ?? null;

      const tokenRes = await axios.post(
        'https://test.api.amadeus.com/v1/security/oauth2/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        { timeout: this.API_TIMEOUT },
      );

      const accessToken = tokenRes.data.access_token;

      const params: any = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults,
        currencyCode: currency,
        max: 50,
      };

      if (travelClass && travelClass !== 'ECONOMY') {
        params.travelClass = travelClass;
      }

      if (returnDate) {
        params.returnDate = returnDate;
      }

      const flightRes = await axios.get(
        'https://test.api.amadeus.com/v2/shopping/flight-offers',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params,
          timeout: this.API_TIMEOUT,
        },
      );

      const flights = flightRes.data?.data || [];

      const carrierCodes = Array.from(
        new Set(
          flights.flatMap((f: any) =>
            f.itineraries.flatMap((i: any) => i.segments.map((s: any) => s.carrierCode)),
          ),
        ),
      );

      const airlineRes = await axios.get(
        'https://test.api.amadeus.com/v1/reference-data/airlines',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { airlineCodes: carrierCodes.join(',') },
          timeout: this.API_TIMEOUT,
        },
      );

      const airlineMap = Object.fromEntries(
        airlineRes.data.data.map((a: any) => [
          a.iataCode,
          {
            name: a.commonName || a.businessName,
            logo: `https://content.airhex.com/content/logos/airlines_${a.iataCode}_100_100_s.png`,
          },
        ]),
      );

      const filteredFlights = flights.filter((f: any) => {
        const price = parseFloat(f.price?.grandTotal ?? f.price?.total);
        if (isNaN(price)) return false;
        if (budgetMin !== null && price < budgetMin) return false;
        if (budgetMax !== null && price > budgetMax) return false;
        return true;
      });

      const mappedFlights = filteredFlights.slice(0, 10).map((f: any) => {
        const grandTotal = Number(f.price?.grandTotal ?? f.price?.total ?? 0);
        const baseFare = Number(f.price?.base ?? 0);
        const taxes = (f.travelerPricings ?? []).reduce((sum: number, tp: any) => {
          return sum + (tp.price?.taxes ?? []).reduce(
            (s: number, t: any) => s + Number(t.amount ?? 0),
            0,
          );
        }, 0);
        const fees = (f.price?.fees ?? []).reduce(
          (sum: number, fee: any) => sum + Number(fee.amount ?? 0),
          0,
        );

        return {
          id: f.id,
          price: grandTotal,
          totalPrice: grandTotal,
          baseFare,
          taxes,
          fees,
          currency: f.price?.currency,
          itineraries: f.itineraries.map((i: any) => ({
            duration: i.duration,
            segments: i.segments.map((s: any) => ({
              from: s.departure?.iataCode,
              to: s.arrival?.iataCode,
              departureTime: s.departure?.at,
              arrivalTime: s.arrival?.at,
              terminal: s.departure?.terminal ?? null,
              arrivalTerminal: s.arrival?.terminal ?? null,
              carrierCode: s.carrierCode,
              airlineName: airlineMap[s.carrierCode]?.name || 'Unknown Airline',
              airlineLogo: airlineMap[s.carrierCode]?.logo || null,
              flightNumber: s.number,
              aircraft: s.aircraft?.code,
              duration: s.duration,
              numberOfStops: s.numberOfStops ?? 0,
            })),
          })),
          flightOffer: f,
        };
      });

      console.log(`✅ Found ${mappedFlights.length} flights from ${origin} to ${destination}`);
      return mappedFlights;
    } catch (error) {
      this.handleAPIError(error, 'Amadeus');
      return [];
    }
  }

  private handleAPIError(error: any, apiName: string) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`❌ ${apiName} API Error:`, {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } else {
      console.error(`❌ ${apiName} Error:`, error.message);
    }
  }

  async getAllChatsGroupedByThread(page = 1, limit = 10, search?: string) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      let qb = this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.user', 'user')
        .orderBy('chat.threadId', 'ASC')
        .addOrderBy('chat.createdAt', 'ASC');

      if (search?.trim()) {
        const searchValue = `%${search.trim()}%`;
        qb = qb.andWhere(
          `(user.firstName ILIKE :search
          OR user.lastName ILIKE :search
          OR CONCAT(user.firstName, ' ', user.lastName) ILIKE :search
          OR user.email ILIKE :search)`,
          { search: searchValue },
        );
      }

      const chats = await qb.getMany();

      if (!chats.length) {
        return {
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0, showing: 0, currentPage: page },
        };
      }

      const grouped: Record<string, { user: any; createdAt: Date; messages: any[] }> = {};

      chats.forEach(chat => {
        const thread = chat.threadId || 'default';

        if (!grouped[thread]) {
          grouped[thread] = {
            user: {
              id: chat.user.id,
              name: `${chat.user.firstName} ${chat.user.lastName ?? ''}`.trim(),
              email: chat.user.email,
            },
            createdAt: chat.createdAt,
            messages: [],
          };
        }

        grouped[thread].messages.push({
          id: chat.id,
          prompt: chat.prompt,
          response: chat.response,
          parsedIntent: chat.parsedIntent,
          hotelRecord: chat.hotelRecord,
          flightRecord: chat.flightRecord,
          createdAt: chat.createdAt,
        });
      });

      let groupedArray = Object.entries(grouped).map(([threadId, value]) => ({
        threadId,
        user: value.user,
        createdAt: value.createdAt,
        messages: value.messages,
      }));

      groupedArray.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const total = groupedArray.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedData = groupedArray.slice(start, start + limit);

      return {
        data: paginatedData,
        pagination: { total, page, limit, totalPages, showing: paginatedData.length, currentPage: page },
      };
    } catch (error) {
      console.error('Error fetching grouped chats:', error);
      throw new InternalServerErrorException(
        `Failed to fetch grouped chats: ${error.message}`,
      );
    }
  }

  async getChatsByThread(threadId: string, userId: string) {
    try {
      if (!threadId?.trim()) throw new BadRequestException('Thread ID is required');
      if (!userId?.trim())   throw new BadRequestException('User ID is required');

      const chats = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.user', 'user')
        .where('chat.threadId = :threadId', { threadId })
        .andWhere('chat.userId = :userId', { userId })
        .orderBy('chat.createdAt', 'ASC')
        .getMany();

      if (!chats.length) {
        return { threadId, user: null, messages: [], totalMessages: 0 };
      }

      return {
        threadId,
        user: {
          id: chats[0].user.id,
          name: chats[0].user.firstName,
          email: chats[0].user.email,
        },
        messages: chats.map(msg => ({
          id: msg.id,
          prompt: msg.prompt,
          response: msg.response,
          parsedIntent: msg.parsedIntent,
          createdAt: msg.createdAt,
          hotelRecord: msg.hotelRecord,
          flightRecord: msg.flightRecord,
        })),
        totalMessages: chats.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error fetching chat thread:', error);
      throw new InternalServerErrorException(
        `Failed to fetch chats for thread ${threadId}: ${error.message}`,
      );
    }
  }

  async getPreviews(userId: string) {
    try {
      if (!userId?.trim()) throw new BadRequestException('User ID is required');

      const previews = await this.chatPreviewRepository
        .createQueryBuilder('preview')
        .where('preview.userId = :userId', { userId })
        .orderBy('preview.createdAt', 'DESC')
        .getMany();

      return previews || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error fetching chat previews:', error);
      throw new InternalServerErrorException('Failed to fetch chat previews');
    }
  }
}