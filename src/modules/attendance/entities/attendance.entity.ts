import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('attendance')
@Unique(['enrollmentId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enrollmentId: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
