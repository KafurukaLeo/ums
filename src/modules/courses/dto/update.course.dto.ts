/**
 * Data Transfer Object (DTO) for update.course.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  lecturerId?: number;

  @IsOptional()
  @IsString()
  timetable?: string;
}
