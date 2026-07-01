import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * DTO (Data Transfer Object) for creating a new assignment.
 * Used by lecturers when they post a new assignment into the system.
 * class-validator decorators enforce input validation automatically.
 */
export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsNumber()
  @IsNotEmpty()
  lecturerId: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
