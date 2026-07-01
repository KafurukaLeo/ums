/**
 * Data Transfer Object (DTO) for update-assignment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * DTO for updating an existing assignment.
 * All fields are optional — only the fields provided will be updated.
 */
export class UpdateAssignmentDto {
  /**
   * Descriptive title of the resource or entry.
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Optional detailed description or metadata notes.
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Submission deadline date and time limit.
   */
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  /**
   * URL link directing to external attachments or resources.
   */
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
