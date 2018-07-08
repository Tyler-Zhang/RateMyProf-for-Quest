import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Professor } from './Professor';
import { Suggestion } from './Suggestion';

@Entity()
export class School extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Professor, professor => professor.school)
  professors: Professor[];

  @OneToMany(type => Suggestion, suggestion => suggestion.school)
  suggestions: Suggestion[];
}
