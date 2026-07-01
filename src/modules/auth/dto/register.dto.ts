/**
 * Data Transfer Object (DTO) for register.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/constants/role.enum';

export class RegisterDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Unique email address used for authorization and notifications.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Hashed security password credentials.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  /**
   * User access role category (admin, lecturer, student).
   */
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
