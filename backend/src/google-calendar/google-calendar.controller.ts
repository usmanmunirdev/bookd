import { 
  Controller, 
  Get, 
  Query, 
  Post, 
  Put,
  Delete,
  Body, 
  Req, 
  Res,
  Param,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('google')
export class GoogleCalendarController {
  constructor(
    private readonly calendarService: GoogleCalendarService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  /**
   * Generate Google OAuth URL
   */
  @Get('auth')
  async getAuthUrl(@Req() req: any) {
    const user = req.user;

    if (!user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    const url = this.calendarService.generateAuthUrl(user.sub);
    return { url };
  }

  /**
   * Google OAuth callback with CSRF validation
   */
  @Get('callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
  ) {
    try {
      console.log('📥 Google OAuth callback received');

      if (!code || !state) {
        console.error('❌ Missing code or state parameter');
        return res.redirect(
          `${process.env.FRONTEND_URL}/assistant/settings/calendar-integration?error=missing_params`
        );
      }

      // Parse state to get userId
      let parsedState;
      try {
        parsedState = JSON.parse(state);
      } catch {
        console.error('❌ Invalid state parameter');
        return res.redirect(
          `${process.env.FRONTEND_URL}/assistant/settings/calendar-integration?error=invalid_state`
        );
      }

      const { userId } = parsedState;

      if (!userId) {
        console.error('❌ User ID missing in state');
        return res.redirect(
          `${process.env.FRONTEND_URL}/assistant/settings/calendar-integration?error=invalid_state`
        );
      }

      // Fetch user from DB
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        console.error('❌ User not found:', userId);
        return res.redirect(
          `${process.env.FRONTEND_URL}/assistant/settings/calendar-integration?error=user_not_found`
        );
      }

      // Set credentials with CSRF validation
      await this.calendarService.setCredentials(code, state, user);

      console.log('✅ Google Calendar connected successfully');
      return res.redirect(
        `${process.env.FRONTEND_URL}/assistant/settings/calendar-integration?success=true`
      );
    } catch (err) {
      console.error('❌ Google callback error:', err);
      
      const errorMessage = err.message || 'unknown_error';
      return res.redirect(
        `${process.env.FRONTEND_URL}/assistant/settings/calendar-integration?error=${encodeURIComponent(errorMessage)}`
      );
    }
  }

  /**
   * List Google Calendar events
   */
  @Get('events')
  async getEvents(@Req() req: any, @Query('maxResults') maxResults?: number) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    const max = maxResults ? parseInt(maxResults.toString(), 10) : 10;
    return await this.calendarService.listEvents(req.user.sub, max);
  }

  /**
   * Create Google Calendar event
   */
  @Post('events')
  async createEvent(@Body() body: any, @Req() req: any) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    return await this.calendarService.createEvent(req.user.sub, body);
  }

  /**
   * Update Google Calendar event
   */
  @Put('events/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() body: any,
    @Req() req: any
  ) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    return await this.calendarService.updateEvent(req.user.sub, eventId, body);
  }

  /**
   * Delete Google Calendar event
   */
  @Delete('events/:eventId')
  async deleteEvent(@Param('eventId') eventId: string, @Req() req: any) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    return await this.calendarService.deleteEvent(req.user.sub, eventId);
  }

  /**
   * Check if Google Calendar is connected
   */
  @Get('is-connected')
  async isCalendarConnected(@Req() req: any) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    const connected = await this.calendarService.isCalendarConnected(req.user.sub);
    return { connected };
  }

  /**
   * Disconnect Google Calendar
   */
  @Post('disconnect')
  async disconnectCalendar(@Req() req: any) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }

    await this.calendarService.disconnectCalendar(req.user.sub);

    return {
      success: true,
      message: 'Google Calendar disconnected successfully'
    };
  }

  /**
   * Get list of calendars
   */
  @Get('calendars')
  async getCalendarList(@Req() req: any) {
    if (!req.user) {
      return { error: 'User not authenticated', statusCode: HttpStatus.UNAUTHORIZED };
    }
    
    return await this.calendarService.getCalendarList(req.user.sub);
  }
}