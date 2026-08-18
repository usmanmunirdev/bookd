import { Twilio } from 'twilio';
import * as nodemailer from 'nodemailer';

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const twilioFrom = process.env.TWILIO_PHONE_NUMBER!;

const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export function sendSMSUtil(to: string, message: string) {
  return twilioClient.messages.create({
    body: message,
    from: twilioFrom,
    to,
  });
}

export function sendMailUtil(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  return mailTransporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
}
