/**
 * Data Transfer Object (DTO) for update.course.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateCourseDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Unique alphanumeric identifier code.
   */
  @IsOptional()
  @IsString()
  code?: string;

  /**
   * Foreign key link identifying the associated Lecturer profile.
   */
  @IsOptional()
  @IsInt()
  lecturerId?: number;

  /**
   * Associated property field: timetable.
   */
  @IsOptional()
  @IsString()
  timetable?: string;
}
