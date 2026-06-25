import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'The name of the course', example: 'Introduction to Computer Science' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The unique course code', example: 'CS101' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'The ID of the assigned lecturer', example: 1 })
  @IsOptional()
  @IsInt()
  lecturerId?: number;

  @ApiPropertyOptional({ description: 'The schedule/timetable of the course', example: 'Monday 10:00 - 12:00' })
  @IsOptional()
  @IsString()
  timetable?: string;
}
