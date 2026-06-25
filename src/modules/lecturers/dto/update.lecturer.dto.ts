import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLecturerDto {
  @ApiPropertyOptional({ description: 'The name of the lecturer', example: 'Dr. Jane Smith' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The email address of the lecturer', example: 'jane.smith@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
