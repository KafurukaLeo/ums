/**
 * Data Transfer Object (DTO) for create.enrollment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  /**
   * Foreign key link identifying the associated Student profile.
   */
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  /**
   * Foreign key link identifying the associated Course.
   */
  @IsNotEmpty()
  @IsInt()
  courseId: number;
}
