import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for a student submitting their work for an assignment.
 * Students provide either a file URL or text content (or both).
 */
export class SubmitAssignmentDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsOptional()
  @IsString()
  submissionFileUrl?: string;

  @IsOptional()
  @IsString()
  submissionText?: string;
}
