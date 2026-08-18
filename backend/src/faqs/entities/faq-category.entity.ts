import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Faq } from './faq.entity';

@Entity('faq_categories')
export class FaqCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Faq, (faq) => faq.category, { cascade: true })
    faqs: Faq[];
}
