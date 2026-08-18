import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'plans' })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Plan price (0 for free)
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price: number;

  // Monthly AI query limit (null = unlimited)
  @Column({ type: 'int', nullable: true })
  aiQueryLimit?: number;

  // Feature flags
  @Column({ default: false })
  aiPoweredSearch: boolean;

  @Column({ default: false })
  conciergeAccess: boolean;

  @Column({ default: false })
  flightBooking: boolean;

  @Column({ default: false })
  hotelBooking: boolean;

  @Column({ default: false })
  restaurantBooking: boolean;

  @Column({ default: false })
  calendarReminder: boolean;

  @Column({ default: false })
  emailReminder: boolean;

  @Column({ default: false })
  smsReminder: boolean;

  @Column({ default: false })
  bookingHistory: boolean;

  @Column({ default: false })
  smartRecommendations: boolean;

  @Column({ default: false })
  earlyFeatureAccess: boolean;

  @Column({ default: false })
  prioritySupport: boolean;

  // @Column({ default: false })
  // dedicatedHumanConcierge: boolean;

  // @Column({ default: false })
  // isInviteOnly: boolean;

  // Status
  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  stripeProductId?: string;

  @Column({ nullable: true })
  stripePriceId?: string;

  @Column({ default: 'month' })
  billingInterval: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// @Entity({ name: 'plans' })
// export class Plan {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ length: 100 })
//   title: string; // Plan Name

//   @Column({ type: 'text', nullable: true })
//   description?: string;

//   @Column({ type: 'jsonb', default: () => "'[]'" })
//   features: string[]; 

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   pricePerMonth: number; 

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
