/**
 * Data Transfer Object (DTO) for create.enrollment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @IsNotEmpty()
  @IsInt()
  courseId: number;
}
