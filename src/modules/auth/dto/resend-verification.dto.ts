import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @ApiProperty({ description: 'The email address of the user', example: 'john.smith@university.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
