import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationTokenExpires?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
