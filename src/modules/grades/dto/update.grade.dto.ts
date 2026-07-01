/**
 * Data Transfer Object (DTO) for update.grade.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateGradeDto {
  /**
   * Foreign key link identifying the associated Course Enrollment.
   */
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  /**
   * Academic mark, grade value, or score awarded.
   */
  @IsOptional()
  @IsNumber()
  grade?: number;
}
