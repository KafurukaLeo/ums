/**
 * TypeORM Database Entity representing COURSE data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class Course {
  /**
   * Unique database identifier (Primary Key).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Full display name of the user or profile record.
   */
  @Column()
  name: string;

  /**
   * Unique alphanumeric identifier code.
   */
  @Column({ unique: true })
  code: string;

  /**
   * Foreign key link identifying the associated Lecturer profile.
   */
  @Column({ nullable: true })
  lecturerId?: number;

  /**
   * Associated property field: timetable.
   */
  @Column({ nullable: true })
  timetable?: string;

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