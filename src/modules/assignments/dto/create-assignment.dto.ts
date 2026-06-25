import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO (Data Transfer Object) for creating a new assignment.
 * Used by lecturers when they post a new assignment into the system.
 * class-validator decorators enforce input validation automatically.
 */
export class CreateAssignmentDto {
  @ApiProperty({ description: 'Title of the assignment', example: 'Week 3 Lab Report' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed instructions for the assignment', example: 'Write a 2-page report on...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID of the course this assignment belongs to', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ description: 'ID of the lecturer creating the assignment', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  lecturerId: number;

  @ApiPropertyOptional({ description: 'Due date for the assignment (ISO 8601)', example: '2026-07-01T23:59:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'URL or path to an attached file (e.g. PDF brief)', example: '/uploads/assignments/brief.pdf' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
