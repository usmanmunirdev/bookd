import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class PersonalPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json', nullable: true })
  preferredCities: string[];

  @Column({ type: 'json', nullable: true })
  favoriteCuisines: string[];

  @Column({ type: 'json', nullable: true })
  diningStyle: string[];

  @Column({ type: 'json', nullable: true })
  preferredSeatings: string[];

  @OneToOne(() => User, (user) => user.personalPreference, {
    onDelete: 'CASCADE',
  })
  
  @JoinColumn()
  user: User;
}
