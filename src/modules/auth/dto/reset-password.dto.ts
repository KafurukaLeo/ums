import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The email address of the user', example: 'john.smith@university.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password reset token', example: 'a1b2c3d4e5...' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'The new password of the user (minimum 6 characters)', example: 'newSecurePass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
