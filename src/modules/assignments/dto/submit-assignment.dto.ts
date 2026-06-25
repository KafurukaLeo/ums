import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for a student submitting their work for an assignment.
 * Students provide either a file URL or text content (or both).
 */
export class SubmitAssignmentDto {
  @ApiProperty({ description: 'ID of the student submitting', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiPropertyOptional({ description: 'URL or path to the uploaded submission file', example: '/uploads/submissions/report.pdf' })
  @IsOptional()
  @IsString()
  submissionFileUrl?: string;

  @ApiPropertyOptional({ description: 'Text content of the submission', example: 'My answer to this assignment is...' })
  @IsOptional()
  @IsString()
  submissionText?: string;
}
