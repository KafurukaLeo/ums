/**
 * TypeORM Database Entity representing ENROLLMENT data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('enrollments')
@Unique(['studentId', 'courseId'])
export class Enrollment {
  /**
   * Unique database identifier (Primary Key).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Foreign key link identifying the associated Student profile.
   */
  @Column()
  studentId: number;

  /**
   * Foreign key link identifying the associated Course.
   */
  @Column()
  courseId: number;

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