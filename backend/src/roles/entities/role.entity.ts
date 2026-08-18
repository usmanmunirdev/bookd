import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  /**
   * This column will store permission details with actions.
   * Instead of a pure ManyToMany, we store a structured JSON array:
   * [{ permissionId: "...", actions: { add: true, view: true, update: false, delete: false } }]
   */
  @Column('jsonb', { default: [] })
  permissions: {
    permissionId: string;
    name: string;
    actions: {
      add: boolean;
      view: boolean;
      update: boolean;
      delete: boolean;
    };
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
