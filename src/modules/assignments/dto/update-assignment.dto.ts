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
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
