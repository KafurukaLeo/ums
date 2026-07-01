/**
 * Data Transfer Object (DTO) for update.enrollment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  /**
   * Foreign key link identifying the associated Student profile.
   */
  @IsOptional()
  @IsInt()
  studentId?: number;

  /**
   * Foreign key link identifying the associated Course.
   */
  @IsOptional()
  @IsInt()
  courseId?: number;
}
