import { Chat } from '../../chat/entities/chat.entity';
import { GoogleCalendarToken } from 'src/google-calendar/entities/google-calendar.entity';
import { NotificationPreferences } from 'src/notifications/entities/notification.entity';
import { PersonalPreference } from 'src/personal-preferences/entities/personal-preference.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { BookingLog } from 'src/booking-log/entities/booking-log.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  OneToOne
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  preferredName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  profileImage?: string | null;

  @Column({ nullable: false })
  timezone: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailOtpExpiresAt: Date | null;

  @Column({ type: 'enum', enum: ['pending', 'active'], default: 'pending' })
  status: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => BookingLog, (log) => log.user)
  bookingLogs: BookingLog[];

  @Column({ type: 'varchar', nullable: true })
  googleId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  normalizeEmail() {
    this.email = this.email.toLowerCase();
  }

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];

  @OneToMany(() => GoogleCalendarToken, (token) => token.user)
  googleTokens: GoogleCalendarToken[];

  @OneToMany(() => NotificationPreferences, (pref) => pref.user)
  notificationPreferences: NotificationPreferences[];

  @OneToOne(() => PersonalPreference, (pp) => pp.user)
  personalPreference: PersonalPreference;

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'varchar', nullable: true })
  paymentMethodId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  last4?: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken?: string | null;

  @Column({ type: 'bigint', nullable: true })
  resetPasswordExpires?: number | null;
}
