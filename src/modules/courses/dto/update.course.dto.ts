import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'The name of the course', example: 'Introduction to Computer Science' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The unique course code', example: 'CS101' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'The ID of the assigned lecturer', example: 1 })
  @IsOptional()
  @IsInt()
  lecturerId?: number;

  @ApiPropertyOptional({ description: 'The schedule/timetable of the course', example: 'Monday 10:00 - 12:00' })
  @IsOptional()
  @IsString()
  timetable?: string;
}
