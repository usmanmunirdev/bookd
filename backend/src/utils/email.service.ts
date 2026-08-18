// email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.from = this.configService.get<string>('MAIL_FROM'); 
    // example: "Bookd Support <Contact@bookd.com>"

    if (!host || !port || !user || !pass || !this.from) {
      throw new Error('Missing email SMTP credentials.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL
      auth: { user, pass },
    });
  }

  /**
   * Send an Email using Nodemailer
   * @param to - recipient email address
   * @param subject - email subject
   * @param html - HTML content
   */
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });

      console.log('📨 Email sent!', info.messageId);
      return info;
    } catch (error: any) {
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }
  }
}
