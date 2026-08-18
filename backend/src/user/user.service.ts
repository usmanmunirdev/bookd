import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update.user.dto';
import * as fs from 'fs';
import { join } from 'path';
import { OAuth2Client } from 'google-auth-library';
import { forgotPasswordTemplate } from 'src/utils/email-templates/forgotPassword';
import { verifyEmailOtpTemplate } from 'src/utils/email-templates/verifyEmailOtp';
import { EmailService } from 'src/utils/email.service';
import Stripe from 'stripe';

interface DecodedToken extends jwt.JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private stripe: Stripe;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,

    private configService: ConfigService,
    private mailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async signup(
    firstName: string,
    lastName: string,
    fullName: string,
    email: string,
    password: string,
    phone: string,
    timezone: string,
    profileImage: string | null,
  ) {
    // 🔍 Check existing user
    const existing: any = await this.userRepo.findOne({ where: { email } });

    if (existing && existing.emailVerified) {
      throw new BadRequestException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let user: any;

    if (existing) {
      existing.emailOtp = otp;
      existing.emailOtpExpiresAt = otpExpiry;
      existing.password = hashed;
      user = await this.userRepo.save(existing);
    } else {
      user = this.userRepo.create({
        firstName,
        lastName,
        fullName,
        email,
        phone,
        timezone,
        password: hashed,
        profileImage,
        emailVerified: false,
        emailOtp: otp,
        emailOtpExpiresAt: otpExpiry,
        status: 'pending',
      });

      await this.userRepo.save(user);
    }

    // 📧 Send OTP email
    const html = verifyEmailOtpTemplate(user.fullName || 'User', otp);

    await this.mailService.sendEmail(
      user.email,
      'Your Email Verification Code – Bookd',
      html,
    );

    return {
      message: 'OTP sent to your email',
      email,
    };
  }

  async verifyEmailOtp(email: string, otp: string) {
    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new BadRequestException('Invalid request');

    if (
      user.emailOtp !== otp ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // ✅ Mark verified
    user.emailVerified = true;
    user.status = 'active';
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;

    // 🟦 Create Stripe Customer NOW
    const stripeCustomer = await this.createStripeCustomer({
      email: user.email,
      name: user.fullName,
      phone: user.phone ?? undefined,
    });

    user.stripeCustomerId = stripeCustomer.id;
    await this.userRepo.save(user);

    await this.createFreeSubscriptionForUser(user);

    const fullUser: any = await this.userRepo.findOne({
      where: { id: user.id },
      relations: {
        subscription: {
          plan: true,
        },
      },
    });

    const payload = { sub: fullUser.id, email: fullUser.email };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined in environment');

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    console.log("fullUser", fullUser)
    return { fullUser, token };
  }

  async resendOtp(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new BadRequestException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOtp = otp;
    user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.userRepo.save(user);
    const html = verifyEmailOtpTemplate(user.fullName || 'User', otp);

    await this.mailService.sendEmail(
      user.email,
      'Your Email Verification Code – Bookd',
      html,
    );

    return { message: 'OTP resent successfully' };
  }

  private async createStripeCustomer(params: {
    email: string | undefined;
    name: string | undefined;
    phone?: string;
  }) {
    try {
      return await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        // phone: Number(params.phone) || undefined,
        metadata: {
          app: 'BOOKD',
        },
      });
    } catch (error) {
      console.error('Stripe customer creation failed:', error);
      throw new InternalServerErrorException(
        'Failed to create billing profile',
      );
    }
  }

  private async createFreeSubscriptionForUser(user: User) {
    // 🆓 Fetch FREE plan
    const freePlan = await this.planRepo.findOne({
      where: { price: 0 },
    });

    if (!freePlan) {
      throw new InternalServerErrorException('Free plan not found');
    }

    const subscription = this.subscriptionRepo.create({
      userId: user.id,
      user,
      planId: freePlan.id,
      plan: freePlan,
      status: 'active',
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: null,
      stripeProductId: null,
      stripePriceId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      ),
    });

    await this.subscriptionRepo.save(subscription);

    user.subscription = subscription;
    await this.userRepo.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: {
        subscription: {
          plan: true,
        },
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials or user not found');

    if (!user.emailVerified) {
      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailOtp = otp;
      user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
      await this.userRepo.save(user);

      // Send OTP email
      const html = verifyEmailOtpTemplate(user.fullName || 'User', otp);
      await this.mailService.sendEmail(
        user.email,
        'Your Email Verification Code – Bookd',
        html,
      );

      return {
        status: 'unverified',
        message: 'Email not verified. OTP sent to your email.',
        email: user.email,
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined in environment');

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return { token, user };
  }

  async loginWithGoogle(googleToken: string, timezone: any) {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (!clientId) throw new Error('Missing Google Client Id.');

      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const { email, name, picture, sub } = payload;

      let user = await this.userRepo.findOne({
        where: { email },
        relations: {
          subscription: {
            plan: true,
          },
        },
      });

      // 🆕 New Google User
      if (!user) {
        // 🔵 Create Stripe customer
        const stripeCustomer = await this.createStripeCustomer({
          email,
          name,
        });

        user = this.userRepo.create({
          firstName: name,
          email,
          profileImage: picture,
          googleId: sub,
          timezone,
          stripeCustomerId: stripeCustomer.id,
          emailVerified: true
        });

        user = await this.userRepo.save(user);

        // 🆓 Create FREE subscription
        await this.createFreeSubscriptionForUser(user);
      }

      // 🔄 Reload user with subscription + plan
      const fullUser: any = await this.userRepo.findOne({
        where: { id: user.id },
        relations: {
          subscription: {
            plan: true,
          },
        },
      });

      const token = jwt.sign(
        { sub: fullUser.id, email: fullUser.email },
        secret,
        { expiresIn: '7d' },
      );

      return { user: fullUser, token };
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Google login failed');
    }
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    if (data.profileImage && user.profileImage) {
      const oldImagePath = join(
        __dirname,
        '..',
        '..',
        'public',
        user.profileImage,
      );
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.error('Failed to delete old profile image:', error);
      }
    }

    if (data.firstName !== undefined) {
      user.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      user.lastName = data.lastName;
    }

    // 🧠 Derive fullName safely
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const first = data.firstName ?? user.firstName ?? '';
      const last = data.lastName ?? user.lastName ?? '';

      user.fullName = `${first} ${last}`.trim();
    }

    // 📦 Assign remaining safe fields
    const { firstName, lastName, ...rest } = data;
    Object.assign(user, rest);
    return await this.userRepo.save(user);
  }

  async getUser(userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: {
          subscription: {
            plan: true,
          },
        },
      });

      if (!user) throw new UnauthorizedException('User not found');
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  verifyToken(token: string) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined in environment');

    return jwt.verify(token, secret);
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment');
      }

      const token = jwt.sign(
        { sub: user.id },
        secret,
        { expiresIn: '15m' }
      );

      const hashedToken = await bcrypt.hash(token, 10);

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await this.userRepo.save(user);

      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      const html = forgotPasswordTemplate(
        user.fullName || 'User',
        resetLink,
      );

      // Send email
      await this.mailService.sendEmail(
        user.email,
        'Reset Your Password – Bookd',
        html,
      );

      return { message: 'Password reset link sent to your email' };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new InternalServerErrorException(
        error.message || 'Failed to process forgot password request'
      );
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      if (!newPassword) throw new BadRequestException('New password is required');

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) throw new Error('JWT_SECRET is not defined in environment');

      let decoded: DecodedToken;
      try {
        decoded = jwt.verify(token, secret) as DecodedToken;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
      const user = await this.userRepo.findOne({ where: { id: decoded.sub } });

      if (!user) throw new NotFoundException('User not found');

      if (!user.resetPasswordToken || !user.resetPasswordExpires)
        throw new UnauthorizedException('Reset token not found');

      // Compare the token
      const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
      if (!isMatch) throw new UnauthorizedException('Invalid reset token');

      if (Date.now() > user.resetPasswordExpires)
        throw new UnauthorizedException('Token expired');

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await this.userRepo.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Failed to reset password'
      );
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      if (!currentPassword || !newPassword)
        throw new BadRequestException('Current and new password are required');

      if (currentPassword === newPassword)
        throw new BadRequestException('New password must differ from current password');

      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepo.save(user);

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Failed to change password');
    }
  }

  async deleteSignUpUser(email: string) {
    try {
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.emailVerified) {
        throw new BadRequestException(
          'Verified users cannot be deleted'
        );
      }

      await this.userRepo.delete(user.id);

      return {
        message: 'Unverified signup user deleted successfully',
      };
    } catch (error) {
      console.error('Deleting signup user failed:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to delete signup user'
      );
    }
  }

}
