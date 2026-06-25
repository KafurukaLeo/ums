import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'The email address of the user', example: 'john.smith@university.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'securePass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
