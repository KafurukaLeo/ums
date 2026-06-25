import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'The ID of the student', example: 1 })
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @ApiProperty({ description: 'The ID of the course', example: 101 })
  @IsNotEmpty()
  @IsInt()
  courseId: number;
}
