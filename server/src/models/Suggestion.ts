import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, Index, CreateDateColumn, ManyToOne } from 'typeorm';
import { University } from './University';

@Entity()
export class Suggestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Index()
  @Column()
  name: string;

  @Column()
  url: string;

  @ManyToOne(type => University)
  university: University;
}
