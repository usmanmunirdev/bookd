import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('chat_preview')
export class ChatPreview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.chats, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  threadId: string | null;

  @Column({ type: 'varchar', length: 120 })
  title: string; // e.g. "Trip to Dubai"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
