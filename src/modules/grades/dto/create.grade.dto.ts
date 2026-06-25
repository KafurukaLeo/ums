import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ description: 'The ID of the enrollment', example: 1 })
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  @ApiProperty({ description: 'The numeric grade value', example: 3.8 })
  @IsNotEmpty()
  @IsNumber()
  grade: number;
}
