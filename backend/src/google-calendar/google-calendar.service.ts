import { Injectable, InternalServerErrorException, UnauthorizedException, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { User } from '../user/entities/user.entity';
import { GoogleCalendarToken } from './entities/google-calendar.entity';

@Injectable()
export class GoogleCalendarService implements OnModuleDestroy {
  private oauth2Client;
  private readonly ENCRYPTION_KEY: Buffer;
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly csrfTokens = new Map<string, { userId: string; expiresAt: number }>();
  private csrfCleanupInterval: NodeJS.Timeout;

  constructor(
    @InjectRepository(GoogleCalendarToken)
    private readonly tokenRepo: Repository<GoogleCalendarToken>,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    // Generate encryption key from environment variable
    const encryptionSecret = process.env.ENCRYPTION_SECRET || 'your-secret-key-min-32-chars-long';
    this.ENCRYPTION_KEY = scryptSync(encryptionSecret, 'salt', 32);

    // Clean up expired CSRF tokens every 10 minutes
    this.csrfCleanupInterval = setInterval(() => this.cleanupExpiredCsrfTokens(), 10 * 60 * 1000);
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.ALGORITHM, this.ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = createDecipheriv(this.ALGORITHM, this.ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt token');
    }
  }

  /**
   * Generate CSRF token and store it temporarily
   */
  private generateCsrfToken(userId: string): string {
    const csrfToken = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.csrfTokens.set(csrfToken, { userId, expiresAt });

    return csrfToken;
  }

  /**
   * Validate CSRF token
   */
  private validateCsrfToken(csrfToken: string, userId: string): boolean {
    const stored = this.csrfTokens.get(csrfToken);

    if (!stored) {
      return false;
    }

    if (stored.expiresAt < Date.now()) {
      this.csrfTokens.delete(csrfToken);
      return false;
    }

    if (stored.userId !== userId) {
      return false;
    }

    // Delete token after use (one-time use)
    this.csrfTokens.delete(csrfToken);

    return true;
  }

  /**
   * Clean up expired CSRF tokens
   */
  onModuleDestroy() {
    clearInterval(this.csrfCleanupInterval);
  }

  private cleanupExpiredCsrfTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.csrfTokens.entries()) {
      if (data.expiresAt < now) {
        this.csrfTokens.delete(token);
      }
    }
  }

  /**
   * Generate Google OAuth URL with CSRF protection
   */
  generateAuthUrl(userId: string) {
    try {
      const csrfToken = this.generateCsrfToken(userId);

      const url = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        prompt: 'consent',
        state: JSON.stringify({ userId, csrf: csrfToken }),
      });

      console.log('🔗 Generated Google Auth URL with CSRF protection');
      return url;

    } catch (err) {
      console.error('Error generating Google auth URL:', err);
      throw new InternalServerErrorException('Failed to generate Google auth URL');
    }
  }

  /**
   * Set credentials with encryption and CSRF validation
   */
  async setCredentials(code: string, state: string, user: User) {
    try {
      // Parse and validate state
      let parsedState;
      try {
        parsedState = JSON.parse(state);
      } catch {
        throw new UnauthorizedException('Invalid state parameter');
      }

      const { userId, csrf } = parsedState;

      if (!userId || !csrf) {
        throw new UnauthorizedException('Missing state parameters');
      }

      // Validate CSRF token
      if (!this.validateCsrfToken(csrf, userId)) {
        throw new UnauthorizedException('Invalid or expired CSRF token');
      }

      // Validate user ID matches
      if (userId !== user.id) {
        throw new UnauthorizedException('User ID mismatch');
      }

      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);

      // Validate that we received the required tokens
      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      // Check if token already exists for this user
      let entity = await this.tokenRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (entity) {
        // Update existing token with encryption
        entity.accessToken = this.encrypt(tokens.access_token);
        if (tokens.refresh_token) {
          entity.refreshToken = this.encrypt(tokens.refresh_token);
        }
        entity.scope = tokens.scope;
        entity.tokenType = tokens.token_type;
        entity.expiryDate = tokens.expiry_date ? tokens.expiry_date.toString() : entity.expiryDate;
        await this.tokenRepo.save(entity);
      } else {
        // Create new token with encryption
        entity = this.tokenRepo.create({
          accessToken: this.encrypt(tokens.access_token),
          refreshToken: tokens.refresh_token ? this.encrypt(tokens.refresh_token) : '',
          scope: tokens.scope,
          tokenType: tokens.token_type,
          expiryDate: tokens.expiry_date ? tokens.expiry_date.toString() : null,
          user,
        });
        await this.tokenRepo.save(entity);
      }

      console.log('✅ Google credentials saved successfully');
      return { success: true };
    } catch (err) {
      console.error('Error setting Google credentials:', err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to set Google credentials');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(token: any): Promise<string> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      const decryptedRefreshToken = this.decrypt(token.refreshToken);
      
      oauth2Client.setCredentials({
        refresh_token: decryptedRefreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token received during refresh');
      }

      // Update token in database
      token.accessToken = this.encrypt(credentials.access_token);
      token.expiryDate = credentials.expiry_date?.toString();
      await this.tokenRepo.save(token);

      console.log('✅ Access token refreshed successfully');

      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      
      // If refresh fails, the token might be revoked
      if (error.response?.status === 400 || error.response?.status === 401) {
        await this.tokenRepo.remove(token);
        throw new UnauthorizedException('Google Calendar access has been revoked. Please reconnect.');
      }
      
      throw error;
    }
  }

  /**
   * Get valid OAuth client with token refresh
   */
  private async getAuthenticatedClient(userId: string) {
    const token = await this.tokenRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!token) {
      throw new UnauthorizedException('No Google Calendar connection found. Please connect your calendar.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    let accessToken = this.decrypt(token.accessToken);
    const refreshToken = this.decrypt(token.refreshToken);
    const expiryDate = token.expiryDate ? Number(token.expiryDate) : undefined;

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = expiryDate && expiryDate < Date.now() + 5 * 60 * 1000;

    if (isExpired && refreshToken) {
      console.log('🔄 Token expired, refreshing...');
      accessToken = await this.refreshAccessToken(token);
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
    });

    return oauth2Client;
  }

  /**
   * List Google Calendar events with automatic token refresh
   */
  async listEvents(userId: string, maxResults: number = 10) {
    try {
      const oauth2Client = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const now = new Date();
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return res.data.items || [];
    } catch (err) {
      console.error('Error fetching Google Calendar events:', err);
      
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token is invalid, remove it
        await this.disconnectCalendar(userId);
        throw new UnauthorizedException('Google Calendar access is invalid. Please reconnect.');
      }

      throw new InternalServerErrorException('Failed to fetch Google Calendar events');
    }
  }

  /**
   * Check if calendar is connected
   */
  async isCalendarConnected(userId: string): Promise<boolean> {
    try {
      const token = await this.tokenRepo.findOne({
        where: { user: { id: userId } },
      });
      return !!token && !!token.accessToken && !!token.refreshToken;
    } catch (err) {
      console.error('Error checking Google Calendar connection:', err);
      return false;
    }
  }

  /**
   * Create Google Calendar event with automatic token refresh
   */
  async createEvent(userId: string, eventData: any) {
    try {
      // Validate event data
      if (!eventData.summary || !eventData.start || !eventData.end) {
        throw new Error('Missing required event fields: summary, start, end');
      }

      const oauth2Client = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      console.log('✅ Event created successfully:', res.data.id);
      return res.data;
    } catch (err) {
      console.error('Error creating Google Calendar event:', err);

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      if (err.response?.status === 401 || err.response?.status === 403) {
        await this.disconnectCalendar(userId);
        throw new UnauthorizedException('Google Calendar access is invalid. Please reconnect.');
      }

      throw new InternalServerErrorException('Failed to create Google Calendar event');
    }
  }

  /**
   * Update Google Calendar event
   */
  async updateEvent(userId: string, eventId: string, eventData: any) {
    try {
      const oauth2Client = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const res = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: eventData,
      });

      console.log('✅ Event updated successfully:', res.data.id);
      return res.data;
    } catch (err) {
      console.error('Error updating Google Calendar event:', err);

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      if (err.response?.status === 401 || err.response?.status === 403) {
        await this.disconnectCalendar(userId);
        throw new UnauthorizedException('Google Calendar access is invalid. Please reconnect.');
      }

      throw new InternalServerErrorException('Failed to update Google Calendar event');
    }
  }

  /**
   * Delete Google Calendar event
   */
  async deleteEvent(userId: string, eventId: string) {
    try {
      const oauth2Client = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      console.log('✅ Event deleted successfully:', eventId);
      return { success: true, message: 'Event deleted successfully' };
    } catch (err) {
      console.error('Error deleting Google Calendar event:', err);

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      if (err.response?.status === 401 || err.response?.status === 403) {
        await this.disconnectCalendar(userId);
        throw new UnauthorizedException('Google Calendar access is invalid. Please reconnect.');
      }

      throw new InternalServerErrorException('Failed to delete Google Calendar event');
    }
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnectCalendar(userId: string): Promise<void> {
    try {
      const token = await this.tokenRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!token) {
        throw new Error('No Google Calendar connection found for user');
      }

      // Revoke the token with Google
      if (token.accessToken) {
        try {
          const decryptedToken = this.decrypt(token.accessToken);
          await this.oauth2Client.revokeToken(decryptedToken);
          console.log('✅ Google token revoked successfully');
        } catch (revokeError) {
          console.warn('⚠️ Failed to revoke token with Google:', revokeError.message);
          // Continue with deletion even if revocation fails
        }
      }

      // Delete the token from database
      await this.tokenRepo.remove(token);
      console.log('✅ Google Calendar disconnected for user:', userId);

    } catch (err) {
      console.error('Error disconnecting Google Calendar:', err);
      if (err.message === 'No Google Calendar connection found for user') {
        throw new Error(err.message);
      }
      throw new InternalServerErrorException('Failed to disconnect Google Calendar');
    }
  }

  /**
   * Get calendar list
   */
  async getCalendarList(userId: string) {
    try {
      const oauth2Client = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const res = await calendar.calendarList.list();

      return res.data.items || [];
    } catch (err) {
      console.error('Error fetching calendar list:', err);

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new InternalServerErrorException('Failed to fetch calendar list');
    }
  }
}