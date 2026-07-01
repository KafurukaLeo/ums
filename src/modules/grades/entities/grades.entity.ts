/**
 * TypeORM Database Entity representing GRADES data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('grades')
@Unique(['enrollmentId'])
export class Grade {
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
   * Academic mark, grade value, or score awarded.
   */
  @Column({ type: 'float' })
  grade: number;

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