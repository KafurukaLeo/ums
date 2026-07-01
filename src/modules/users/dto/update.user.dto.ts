import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/constants/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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
