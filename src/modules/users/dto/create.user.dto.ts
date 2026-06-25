import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'jane.doe@university.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'securePass123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'The role of the user', enum: Role, example: Role.STUDENT })
  @IsOptional()
  @IsString()
  role?: string;
}
