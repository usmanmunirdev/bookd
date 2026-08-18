import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { HotelBooking } from './hotel-booking.entity';
import { FlightBooking } from './flight-booking.entity';
import { User } from '../../user/entities/user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'failed' | 'refunded';
export type BookingType = 'hotel' | 'flight';

@Entity('booking_logs')
export class BookingLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bookingLogs, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  bookingType: BookingType;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: BookingStatus;

  @Column({ type: 'varchar', nullable: true })
  failureReason: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripePaymentIntentId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @OneToOne(() => HotelBooking, (hotel) => hotel.bookingLog, { nullable: true, cascade: true })
  hotelBooking?: HotelBooking;

  @OneToOne(() => FlightBooking, (flight) => flight.bookingLog, { nullable: true, cascade: true })
  flightBooking?: FlightBooking;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}