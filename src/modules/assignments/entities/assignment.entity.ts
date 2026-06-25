import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Assignment Entity — maps to the 'assignments' table.
 * Lecturers create assignments for a specific course.
 * Students can then submit responses to those assignments.
 */
@Entity('assignments')
export class Assignment {
  /** Auto-incrementing primary key */
  @PrimaryGeneratedColumn()
  id: number;

  /** Title of the assignment, e.g. "Week 3 Lab Report" */
  @Column()
  title: string;

  /** Detailed description / instructions for the assignment */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /** The course this assignment belongs to (foreign key by ID) */
  @Column()
  courseId: number;

  /** The lecturer who created the assignment (foreign key by ID) */
  @Column()
  lecturerId: number;

  /** Due date — students must submit before this timestamp */
  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  /** Optional URL/path to any file the lecturer attached (e.g. a PDF brief) */
  @Column({ nullable: true })
  attachmentUrl?: string;

  /** Automatically set to the timestamp the row was created */
  @CreateDateColumn()
  createdAt: Date;

  /** Automatically updated whenever the row changes */
  @UpdateDateColumn()
  updatedAt: Date;
}
