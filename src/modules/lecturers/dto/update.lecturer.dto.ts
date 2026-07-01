/**
 * Data Transfer Object (DTO) for update.lecturer.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateLecturerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
