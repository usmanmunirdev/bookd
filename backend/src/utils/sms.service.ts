import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;
  private from: any;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !this.from) {
      throw new Error('Missing Twilio credentials.');
    }

    this.client = twilio(accountSid, authToken); // ✅ Use `new`
  }

  async sendSms(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.from,
        to,
      });
      console.log('✅ SMS sent! SID:', message.sid);
      return message;
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error.message);
      throw error;
    }
  }
}
