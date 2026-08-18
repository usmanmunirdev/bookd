import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';

@Entity({ name: 'chat_with_agents' })
export class ChatWithAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chatId: string;

  @Column({ default: 'USER' })
  senderType: 'USER' | 'ADMIN';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn({ name: 'adminId' })
  admin?: AdminUser;

  @Column({ nullable: true })
  adminId: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;
}
