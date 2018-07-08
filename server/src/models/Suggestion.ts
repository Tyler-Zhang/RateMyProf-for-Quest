import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, UpdateDateColumn, Index, CreateDateColumn } from 'typeorm';
import { University } from './University';

@Entity()
export class Suggestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column()
  @Index()
  name: string | null;

  @Column()
  url: string;

  @OneToOne(type => University)
  @JoinColumn()
  university: University;
}
