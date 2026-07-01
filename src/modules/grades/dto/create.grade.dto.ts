/**
 * Data Transfer Object (DTO) for create.grade.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGradeDto {
  /**
   * Foreign key link identifying the associated Course Enrollment.
   */
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  /**
   * Academic mark, grade value, or score awarded.
   */
  @IsNotEmpty()
  @IsNumber()
  grade: number;
}
