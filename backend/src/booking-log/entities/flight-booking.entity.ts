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

export type TravelerType = 'ADULT' | 'CHILD' | 'INFANT';
export type GenderType = 'MALE' | 'FEMALE';
export type SeatTypePreference = 'WINDOW' | 'MIDDLE' | 'AISLE' | 'NO_PREFERENCE';

export interface TravelerInfo {
  id: string;
  type: TravelerType;
  firstName: string;
  lastName: string;
  gender: GenderType;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssuingCountry?: string;
}

export interface SeatAssignment {
  travelerId: string;
  segmentId: string;
  seatNumber: string | null;
  seatType: SeatTypePreference;
}

@Entity('flight_bookings')
export class FlightBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => BookingLog, (log) => log.flightBooking, { onDelete: 'CASCADE' })
  @JoinColumn()
  bookingLog: BookingLog;

  // --- Amadeus Reference ---
  @Column({ type: 'varchar', nullable: true })
  amadeusOrderId: string | null;

  @Column({ type: 'varchar', nullable: true })
  pnr: string | null;

  @Column({ type: 'varchar', nullable: true })
  clientReference: string | null;

  // --- Airline ---
  @Column({ type: 'varchar' })
  airlineName: string;

  @Column({ type: 'varchar' })
  airlineCode: string;

  @Column({ type: 'varchar', nullable: true })
  airlineLogo: string | null;

  @Column({ type: 'varchar' })
  flightNumber: string;

  // --- Route ---
  @Column({ type: 'varchar' })
  departureAirport: string;

  @Column({ type: 'varchar', nullable: true })
  departureAirportName: string | null;

  @Column({ type: 'varchar', nullable: true })
  departureCity: string | null;

  @Column({ type: 'varchar', nullable: true })
  departureCountry: string | null;

  @Column({ type: 'varchar', nullable: true })
  departureTerminal: string | null;

  @Column({ type: 'varchar' })
  arrivalAirport: string;

  @Column({ type: 'varchar', nullable: true })
  arrivalAirportName: string | null;

  @Column({ type: 'varchar', nullable: true })
  arrivalCity: string | null;

  @Column({ type: 'varchar', nullable: true })
  arrivalCountry: string | null;

  @Column({ type: 'varchar', nullable: true })
  arrivalTerminal: string | null;

  @Column({ type: 'timestamp' })
  departureTime: Date;

  @Column({ type: 'timestamp' })
  arrivalTime: Date;

  @Column({ type: 'varchar', nullable: true })
  duration: string | null;

  @Column({ type: 'varchar', nullable: true })
  travelClass: string | null;

  @Column({ type: 'boolean', default: false })
  isDirectFlight: boolean;

  @Column({ type: 'int', default: 0 })
  numberOfStops: number;

  // --- Segments ---
  @Column({ type: 'json', nullable: true })
  segments: any[] | null;

  @Column({ type: 'json', nullable: true })
  itineraries: any[] | null;

  // --- Passengers ---
  @Column({ type: 'int', default: 1 })
  adults: number;

  @Column({ type: 'int', default: 0 })
  children: number;

  @Column({ type: 'int', default: 0 })
  infants: number;

  @Column({ type: 'json', nullable: true })
  travelers: TravelerInfo[] | null;

  // --- Seat Selection ---
  @Column({ type: 'json', nullable: true })
  seatAssignments: SeatAssignment[] | null;

  // --- Baggage ---
  @Column({ type: 'varchar', nullable: true })
  includedBaggage: string | null;

  @Column({ type: 'json', nullable: true })
  baggageAllowance: any | null;

  // --- Pricing ---
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ticketPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseFare: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxes: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fees: number | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @Column({ type: 'json', nullable: true })
  travelerPricings: any[] | null;

  // --- Fare Details ---
  @Column({ type: 'varchar', nullable: true })
  fareBasis: string | null;

  @Column({ type: 'varchar', nullable: true })
  fareClass: string | null;

  @Column({ type: 'varchar', nullable: true })
  validatingAirlineCode: string | null;

  // --- Ticketing ---
  @Column({ type: 'json', nullable: true })
  ticketingAgreement: any | null;

  @Column({ type: 'timestamp', nullable: true })
  ticketingDeadline: Date | null;

  // --- Contact ---
  @Column({ type: 'varchar', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  contactPhone: string | null;

  // --- Special Requests ---
  @Column({ type: 'text', nullable: true })
  specialRequests: string | null;

  // --- Payment ---
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