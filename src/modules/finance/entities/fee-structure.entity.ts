/**
 * TypeORM Database Entity representing FEE-STRUCTURE data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

/**
 * FeeStructure Entity — maps to the 'fee_structures' table in the database.
 * This entity defines how much tuition fees are required for a particular degree program,
 * academic year, and semester.
 */
@Entity('fee_structures')
@Unique(['program', 'academicYear', 'semester']) // Ensures only one fee configuration per program, year, and semester
export class FeeStructure {
  /** Auto-incrementing primary key */
  @PrimaryGeneratedColumn()
  id: number;

  /** 
   * The program this fee structure belongs to (e.g. "Computer Science").
   * Matches the 'program' field in the student profile.
   */
  @Column()
  program: string;

  /** The academic year for which this fee is configured (e.g., 2026) */
  @Column({ type: 'int' })
  academicYear: number;

  /** The semester of the academic year (e.g. 1 or 2) */
  @Column({ type: 'int' })
  semester: number;

  /** The total amount of tuition fees required for the semester (e.g., 1500.00) */
  @Column({ type: 'float' })
  totalAmount: number;

  /** The timestamp when this fee configuration was created */
  @CreateDateColumn()
  createdAt: Date;

  /** The timestamp when this fee configuration was last updated */
  @UpdateDateColumn()
  updatedAt: Date;
}
