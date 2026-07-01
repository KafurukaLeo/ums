/**
 * Data Transfer Object (DTO) for update.admin.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
