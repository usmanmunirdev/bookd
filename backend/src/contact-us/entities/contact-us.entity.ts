import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';

@Entity('contact_us')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  fullName: string;

  @Column({ length: 150 })
  email: string;

  @Column({ length: 200 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  replySubject?: string;

  @Column({ type: 'text', nullable: true })
  reply?: string;

  @Column({ type: 'timestamp', nullable: true })
  repliedAt?: Date;

  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'replied_by' })
  repliedBy?: AdminUser;
}
