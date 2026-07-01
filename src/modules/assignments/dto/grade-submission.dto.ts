import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO for a lecturer grading a student's submission.
 * After reviewing the submission, the lecturer provides a grade and optional feedback.
 */
export class GradeSubmissionDto {
  @IsOptional()
  @IsNumber()
  grade?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
