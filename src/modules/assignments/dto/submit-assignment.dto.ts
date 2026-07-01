/**
 * Data Transfer Object (DTO) for submit-assignment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for a student submitting their work for an assignment.
 * Students provide either a file URL or text content (or both).
 */
export class SubmitAssignmentDto {
  /**
   * Foreign key link identifying the associated Student profile.
   */
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  /**
   * Uploaded file URL containing the student response work.
   */
  @IsOptional()
  @IsString()
  submissionFileUrl?: string;

  /**
   * Written text response provided by the student.
   */
  @IsOptional()
  @IsString()
  submissionText?: string;
}
