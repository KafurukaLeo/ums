import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'The name of the department', example: 'Computer Science & Engineering' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
