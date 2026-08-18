import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FaqCategory } from './faq-category.entity';

@Entity('faqs')
export class Faq {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    question: string;

    @Column('text')
    answer: string;

    @ManyToOne(() => FaqCategory, (category) => category.faqs, {
        onDelete: 'CASCADE',
    })
    category: FaqCategory;
}
