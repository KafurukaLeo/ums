import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for a lecturer grading a student's submission.
 * After reviewing the submission, the lecturer provides a grade and optional feedback.
 */
export class GradeSubmissionDto {
  @ApiPropertyOptional({ description: 'Numeric grade for the submission (e.g. 85.5)', example: 85.5 })
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional({ description: 'Written feedback for the student', example: 'Good effort, but missing section 3.' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
