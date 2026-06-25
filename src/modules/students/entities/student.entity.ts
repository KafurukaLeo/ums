import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * The Student Entity maps directly to the 'students' table in the database.
 * It holds the full registration profile for every student in the university.
 *
 * Columns include:
 *  - Personal info: full name, email, date of birth
 *  - Address info: village, sector, district, province, country
 *  - Academic info: department, education level
 */
@Entity('students')
export class Student {

  /** Auto-incrementing integer primary key */
  @PrimaryGeneratedColumn()
  id: number;

  /** Full name of the student (e.g. "John Mugisha Doe") */
  @Column()
  name: string;

  /** University email — unique per student */
  @Column({ unique: true })
  email: string;

  /** Village or neighbourhood where the student lives */
  @Column({ nullable: true })
  village?: string;

  /** Administrative sector of the student's address */
  @Column({ nullable: true })
  sector?: string;

  /** District (e.g. "Gasabo", "Kicukiro") */
  @Column({ nullable: true })
  district?: string;

  /** Province (e.g. "Kigali City", "Northern Province") */
  @Column({ nullable: true })
  province?: string;

  /** Country of residence (e.g. "Rwanda") */
  @Column({ nullable: true })
  country?: string;

  /** Department the student is enrolled in (e.g. "Computer Science", "Business Administration") */
  @Column({ nullable: true })
  department?: string;

  /** Date of birth (stored as a date column) */
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  /**
   * Highest education level attained before joining the university.
   * Examples: "O-Level", "A-Level", "Diploma", "Bachelor's Degree"
   */
  @Column({ nullable: true })
  educationLevel?: string;

  /** Program the student is enrolled in (e.g. "BSc Computer Science") */
  @Column({ nullable: true })
  program?: string;

  /** Contact phone number */
  @Column({ nullable: true })
  phoneNumber?: string;

  /** Automatically set to the date/time the student record was created */
  @CreateDateColumn()
  createdAt: Date;

  /** Automatically updated whenever the student record changes */
  @UpdateDateColumn()
  updatedAt: Date;
}