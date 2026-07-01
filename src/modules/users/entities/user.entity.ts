/**
 * TypeORM Database Entity representing USER data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
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
   * Unique email address used for authorization and notifications.
   */
  @Column({ unique: true })
  email: string;

  /**
   * User access role category (admin, lecturer, student).
   */
  @Column({ default: 'user' })
  role: string;

  /**
   * Hashed security password credentials.
   */
  @Column({ nullable: true })
  password?: string;

  /**
   * Boolean flag confirming if the email has been verified.
   */
  @Column({ default: false })
  isEmailVerified: boolean;

  /**
   * Security token used to verify email ownership.
   */
  @Column({ nullable: true })
  emailVerificationToken?: string;

  /**
   * Expiration timestamp for the email verification token.
   */
  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationTokenExpires?: Date;

  /**
   * Security token used to verify password reset requests.
   */
  @Column({ nullable: true })
  resetPasswordToken?: string;

  /**
   * Expiration timestamp for the password reset token.
   */
  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires?: Date;

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
