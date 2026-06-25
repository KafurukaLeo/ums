import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'The email address of the user', example: 'john.smith@university.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The 6-digit email verification code', example: '123456' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
