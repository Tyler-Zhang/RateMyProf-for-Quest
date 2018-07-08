import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Professor } from './Professor';

@Entity()
export class University extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Professor, professor => professor.university)
  professors: Professor[];
}
