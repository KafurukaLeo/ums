import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'The name of the user', example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The email address of the user', example: 'jane.doe@university.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'The role of the user', enum: Role, example: Role.STUDENT })
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @IsOptional()
  emailVerificationTokenExpires?: Date;

  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  @IsOptional()
  resetPasswordExpires?: Date;
}
