import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Index, CreateDateColumn, ManyToOne } from 'typeorm';
import { School } from './School';
import { IsUrl } from 'class-validator';

@Entity()
export class Suggestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Index()
  @Column()
  name: string;

  @IsUrl()
  @Column()
  url: string;

  @ManyToOne(type => School)
  school: School;
}
