/**
 * TypeORM Database Entity representing DASHBOARD data model.
 * Defines table schema, column properties, and relationship mappings.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dashboard')
export class Dashboard {
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
