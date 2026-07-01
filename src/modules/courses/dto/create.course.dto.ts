/**
 * Data Transfer Object (DTO) for create.course.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCourseDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Unique alphanumeric identifier code.
   */
  @IsNotEmpty()
  @IsString()
  code: string;

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
