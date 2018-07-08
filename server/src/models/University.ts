import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Professor } from './Professor';
import { Suggestion } from './Suggestion';

@Entity()
export class University extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Professor, professor => professor.university)
  professors: Professor[];

  @OneToMany(type => Suggestion, suggestion => suggestion.university)
  suggestions: Suggestion[];
}
