import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, UpdateDateColumn, Index, ManyToOne } from 'typeorm';
import { University } from './University';

@Entity()
@Index(["name", "university"], { unique: true })
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

  @Column({ type: 'integer', unique: true, nullable: true })
  resourceId: number | null;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  quality: number | null;

  @Column({ type: 'integer', nullable: true })
  retake: number | null;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  easiness: number | null;

  @Column({ type: 'integer', nullable: true })
  count: number | null;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ type: 'text', nullable: true })
  department: string | null;

  @ManyToOne(type => University, { nullable: false })
  university: University;
}
