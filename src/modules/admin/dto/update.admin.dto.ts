import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdminDto {
  @ApiPropertyOptional({ description: 'The name of the admin', example: 'Admin User' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The email address of the admin', example: 'admin@university.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'The password of the admin (minimum 6 characters)', example: 'securePassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
