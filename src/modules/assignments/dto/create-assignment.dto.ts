/**
 * Data Transfer Object (DTO) for create-assignment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * DTO (Data Transfer Object) for creating a new assignment.
 * Used by lecturers when they post a new assignment into the system.
 * class-validator decorators enforce input validation automatically.
 */
export class CreateAssignmentDto {
  /**
   * Descriptive title of the resource or entry.
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * Optional detailed description or metadata notes.
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Foreign key link identifying the associated Course.
   */
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  /**
   * Foreign key link identifying the associated Lecturer profile.
   */
  @IsNumber()
  @IsNotEmpty()
  lecturerId: number;

  /**
   * Submission deadline date and time limit.
   */
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  /**
   * URL link directing to external attachments or resources.
   */
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
