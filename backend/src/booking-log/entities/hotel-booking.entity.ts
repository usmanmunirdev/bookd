import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingLog } from './booking-log.entity';

@Entity('hotel_bookings')
export class HotelBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => BookingLog, (log) => log.hotelBooking, { onDelete: 'CASCADE' })
  @JoinColumn()
  bookingLog: BookingLog;

  // ── Hotelbeds References ──────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  hotelbedsReference: string | null;

  @Column({ type: 'varchar', nullable: true })
  clientReference: string | null;

  // ── Hotel Identity ────────────────────────────────────────────
  @Column({ type: 'varchar' })
  hotelId: string;

  @Column({ type: 'varchar' })
  hotelName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'varchar', nullable: true })
  categoryName: string | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'varchar', nullable: true })
  destinationCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  destinationName: string | null;

  @Column({ type: 'varchar', nullable: true })
  zoneCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  zoneName: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  countryCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  /** renamed from `web` → `website` to match service usage */
  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'varchar', nullable: true })
  chainName: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number | null;

  @Column({ type: 'json', nullable: true })
  images: string[] | null;

  @Column({ type: 'json', nullable: true })
  amenities: any[] | null;

  // ── Stay Details ──────────────────────────────────────────────
  @Column({ type: 'timestamp' })
  checkInDate: Date;

  @Column({ type: 'timestamp' })
  checkOutDate: Date;

  @Column({ type: 'int', nullable: true })
  nights: number | null;

  @Column({ type: 'int', default: 1 })
  adults: number;

  @Column({ type: 'int', default: 0 })
  children: number;

  @Column({ type: 'json', nullable: true })
  childrenAges: number[] | null;

  @Column({ type: 'int', default: 1 })
  rooms: number;

  @Column({ type: 'json', nullable: true })
  paxes: any[] | null;

  // ── Room / Rate Details ───────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  roomCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  roomType: string | null;

  @Column({ type: 'text', nullable: true })
  roomDescription: string | null;

  @Column({ type: 'varchar', nullable: true })
  boardCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  boardName: string | null;

  @Column({ type: 'varchar', nullable: true })
  rateKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  rateType: string | null;

  @Column({ type: 'varchar', nullable: true })
  rateClass: string | null;

  @Column({ type: 'text', nullable: true })
  rateComments: string | null;

  @Column({ type: 'varchar', nullable: true })
  rateCommentsId: string | null;

  @Column({ type: 'int', nullable: true })
  allotment: number | null;

  @Column({ type: 'boolean', default: false })
  packaging: boolean;

  @Column({ type: 'json', nullable: true })
  supplements: any[] | null;

  @Column({ type: 'json', nullable: true })
  taxes: any | null;

  @Column({ type: 'json', nullable: true })
  facilities: any[] | null;

  /** Full structured room + rate data from Hotelbeds response */
  @Column({ type: 'json', nullable: true })
  roomDetails: any | null;

  // ── Payment / Pricing ─────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  paymentType: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  netPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sellingRate: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pendingAmount: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  commission: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  commissionPct: number | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  // ── Cancellation Policy ───────────────────────────────────────
  @Column({ type: 'json', nullable: true })
  cancellationPolicies: any[] | null;

  @Column({ type: 'timestamp', nullable: true })
  cancellationDeadline: Date | null;

  /** Deadline before which cancellation incurs no penalty */
  @Column({ type: 'timestamp', nullable: true })
  freeCancellationDeadline: Date | null;

  @Column({ type: 'boolean', default: false })
  nonRefundable: boolean;

  // ── Holder / Contact ──────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  holderName: string | null;

  @Column({ type: 'varchar', nullable: true })
  holderSurname: string | null;

  @Column({ type: 'varchar', nullable: true })
  holderEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  holderPhone: string | null;

  // ── Remarks ───────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  remark: string | null;

  // ── Raw API response (audit trail) ───────────────────────────
  @Column({ type: 'json', nullable: true })
  rawHotelResponse: any | null;

  // ── Stripe ────────────────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  stripePaymentIntentId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeChargeId: string | null;

  @Column({ type: 'varchar', default: 'unpaid' })
  paymentStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}