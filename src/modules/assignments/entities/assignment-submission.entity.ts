import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * AssignmentSubmission Entity — maps to the 'assignment_submissions' table.
 * Represents a student's submission for a given assignment.
 * Each student can only submit once per assignment (enforced by unique constraint).
 */
@Entity('assignment_submissions')
export class AssignmentSubmission {
  /** Auto-incrementing primary key */
  @PrimaryGeneratedColumn()
  id: number;

  /** The assignment this submission belongs to */
  @Column()
  assignmentId: number;

  /** The student who submitted (references students table ID) */
  @Column()
  studentId: number;

  /** Optional file URL/path the student uploaded as their submission */
  @Column({ nullable: true })
  submissionFileUrl?: string;

  /** Optional text content submitted by the student */
  @Column({ type: 'text', nullable: true })
  submissionText?: string;

  /** Grade given by the lecturer after reviewing the submission (nullable until graded) */
  @Column({ type: 'float', nullable: true })
  grade?: number;

  /** Feedback comment from the lecturer (nullable until provided) */
  @Column({ type: 'text', nullable: true })
  feedback?: string;

  /** Automatically set to the timestamp the row was created */
  @CreateDateColumn()
  submittedAt: Date;

  /** Automatically updated whenever the row changes (e.g. when graded) */
  @UpdateDateColumn()
  updatedAt: Date;
}
