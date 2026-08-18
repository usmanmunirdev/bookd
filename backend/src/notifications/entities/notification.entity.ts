
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


export type DiscreetLevel = 'low' | 'medium' | 'high';

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notificationPreferences, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: true })
  bookingUpdates: boolean;

  @Column({ default: true })
  reminders: boolean;

  @Column({ default: true })
  promotions: boolean;

  @Column({ default: true })
  vipAlerts: boolean;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  discreetPush: DiscreetLevel;
}
