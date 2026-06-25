import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';

export class RegisterDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'john.smith@university.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user (minimum 6 characters)', example: 'securePass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The role of the registering user', enum: Role, example: Role.STUDENT })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
