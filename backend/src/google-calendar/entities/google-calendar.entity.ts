import {
  Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
@Entity('google_calendar_tokens')
export class GoogleCalendarToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  scope: string;

  @Column()
  tokenType: string;

  @Column({ type: 'bigint' })
  expiryDate: string;

  @ManyToOne(() => User, (user) => user.googleTokens, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
