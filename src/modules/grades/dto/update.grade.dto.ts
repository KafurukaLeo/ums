/**
 * Data Transfer Object (DTO) for update.grade.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateGradeDto {
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  @IsOptional()
  @IsNumber()
  grade?: number;
}
