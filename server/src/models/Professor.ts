import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, UpdateDateColumn, Index, ManyToOne } from 'typeorm';
import { Expose, Exclude } from 'class-transformer';
import { School } from './School';

@Exclude()
@Entity()
@Index(["name", "school"], { unique: true })
export class Professor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * isMissing = true if we tried to look for a professor but couldn't find
   * them. By storing it in the database, we ensure that we don't keep trying
   * to scrape for the same professor.
   */
  @Expose({ groups: ['client'] })
  @Column()
  isMissing: boolean;

  @UpdateDateColumn()
  updated: Date;

  @Expose({ groups: ['client'] })
  @Column()
  @Index()
  name: string;

  @Column({ type: 'integer', unique: true, nullable: true })
  resourceId: number | null;

  @Expose({ groups: ['client'] })
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  quality: number | null;

  @Expose({ groups: ['client'] })
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  easiness: number | null;

  @Expose({ groups: ['client'] })
  @Column({ type: 'integer', nullable: true })
  count: number | null;

  @Expose({ groups: ['client'] })
  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ type: 'text', nullable: true })
  department: string | null;

  @ManyToOne(type => School, { nullable: false })
  school: School;
}
