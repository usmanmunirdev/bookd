import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('chat_history')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.chats, { eager: true })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  threadId: string | null;

  @Column()
  prompt: string;

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'jsonb', nullable: true })
  parsedIntent: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  flightRecord: Record<string, any> | any[];

  @Column({ type: 'jsonb', nullable: true })
  hotelRecord: Record<string, any> | any[];

  @CreateDateColumn()
  createdAt: Date;
}
