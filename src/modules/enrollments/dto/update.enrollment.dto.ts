import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ description: 'The ID of the student', example: 1 })
  @IsOptional()
  @IsInt()
  studentId?: number;

  @ApiPropertyOptional({ description: 'The ID of the course', example: 101 })
  @IsOptional()
  @IsInt()
  courseId?: number;
}
