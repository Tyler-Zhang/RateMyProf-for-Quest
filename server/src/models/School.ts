import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, Index } from 'typeorm';
import { Professor } from './Professor';
import { Suggestion } from './Suggestion';

@Entity()
export class School extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @OneToMany(type => Professor, professor => professor.school)
  professors: Professor[];

  @OneToMany(type => Suggestion, suggestion => suggestion.school)
  suggestions: Suggestion[];
}
