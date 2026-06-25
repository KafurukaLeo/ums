import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'The name of the admin', example: 'Admin User' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the admin', example: 'admin@university.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the admin (minimum 6 characters)', example: 'securePassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
