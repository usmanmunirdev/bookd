import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Plan } from 'src/plans/entities/plan.entity';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeProductId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId: string | null;

  @ManyToOne(() => Plan, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'planId' })
  plan: Plan | null;

  @Column({ nullable: true })
  planId: string | null;

  /** 🟡 PENDING PLAN (WAITING FOR PAYMENT) */
  @Column({ type: 'uuid', nullable: true })
  pendingPlanId: string | null;

  @Column({ type: 'varchar', nullable: true })
  pendingStripePriceId: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'trialing', 'past_due', 'canceled', 'unpaid'],
    default: 'pending',
  })
  status: string;

  @OneToOne(() => User, (user) => user.subscription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  userId: string;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodStart: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date | null;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
