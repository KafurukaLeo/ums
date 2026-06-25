import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('grades')
@Unique(['enrollmentId'])
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enrollmentId: number;

  @Column({ type: 'float' })
  grade: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}