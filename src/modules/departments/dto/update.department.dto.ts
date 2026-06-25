import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: 'The name of the department', example: 'Computer Science & Engineering' })
  @IsOptional()
  @IsString()
  name?: string;
}
