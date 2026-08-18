import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { User } from '../../user/entities/user.entity';

@Entity('subscription_payments')
export class SubscriptionPayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Stripe identifiers
    @Index()
    @Column()
    stripeInvoiceId: string;

    @Index()
    @Column({ nullable: true })
    stripePaymentIntentId: string;

    @Column({ nullable: true })
    stripeChargeId: string;

    // Relations
    @ManyToOne(() => Subscription, { onDelete: 'CASCADE' })
    subscription: Subscription;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    // Amounts (Stripe uses cents)
    @Column('int')
    amountPaid: number;

    @Column('int')
    amountDue: number;

    @Column()
    currency: string;

    // Billing period
    @Column({ type: 'timestamp', nullable: true })
    periodStart: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    periodEnd: Date | null;

    // Payment status
    @Column()
    status: string; // paid, open, uncollectible, void, draft, etc.

    // NEW FIELDS for tracking failures
    @Column({ default: false })
    isSuccess: boolean; // Quick flag for filtering successful payments

    @Column({ type: 'text', nullable: true })
    failureReason: string | null; // Store failure message/reason

    @Column({ type: 'text', nullable: true })
    failureCode: string | null; // Store Stripe failure code

    @Column({ type: 'int', default: 0 })
    attemptCount: number; // Track retry attempts

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}