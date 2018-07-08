import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { University } from './University';

@Entity()
export class Professor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * isMissing = true if we tried to look for a professor but couldn't find
   * them. By storing it in the database, we ensure that we don't keep trying
   * to scrape for the same professor.
   */
  @Column()
  isMissing: boolean;

  @UpdateDateColumn()
  updated: Date;

  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  resourceId: number | null;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  quality: number | null;

  @Column()
  retake: number | null;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  easiness: number | null;

  @Column()
  count: number | null;

  @Column()
  url: string | null;

  @Column()
  department: string | null;

  @OneToOne(type => University)
  @JoinColumn()
  university: University;
}
