/**
 * Data Transfer Object (DTO) for create.grade.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGradeDto {
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  @IsNotEmpty()
  @IsNumber()
  grade: number;
}
