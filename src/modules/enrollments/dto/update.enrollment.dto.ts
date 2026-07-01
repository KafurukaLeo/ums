/**
 * Data Transfer Object (DTO) for update.enrollment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  courseId?: number;
}
