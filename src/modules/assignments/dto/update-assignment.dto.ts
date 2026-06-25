import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an existing assignment.
 * All fields are optional — only the fields provided will be updated.
 */
export class UpdateAssignmentDto {
  @ApiPropertyOptional({ description: 'Updated title', example: 'Week 3 Lab Report (Revised)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated description/instructions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated due date (ISO 8601)', example: '2026-07-05T23:59:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Updated attachment URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
