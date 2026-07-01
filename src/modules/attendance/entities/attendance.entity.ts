/**
 * TypeORM Database Entity representing ATTENDANCE data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('attendance')
@Unique(['enrollmentId', 'date'])
export class Attendance {
  /**
   * Unique database identifier (Primary Key).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Foreign key link identifying the associated Course Enrollment.
   */
  @Column()
  enrollmentId: number;

  /**
   * Applicated timestamp or calendar date.
   */
  @Column({ type: 'timestamp' })
  date: Date;

  /**
   * Current status category or enum state.
   */
  @Column()
  status: string;

  /**
   * Timestamp indicating when the record was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Timestamp indicating the last time the record was modified.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
