/**
 * TypeORM Database Entity representing ATTENDANCE data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('attendance')
@Unique(['enrollmentId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enrollmentId: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
