import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiPropertyOptional({ description: 'The ID of the enrollment', example: 1 })
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  @ApiPropertyOptional({ description: 'The numeric grade value', example: 3.8 })
  @IsOptional()
  @IsNumber()
  grade?: number;
}
