import { IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * UpdateStudentDto — validates and documents the payload for updating a student profile.
 *
 * All fields are optional because a PATCH request only needs to contain
 * the fields the user wants to change — not the full student record.
 *
 * This mirrors CreateStudentDto but every field is optional.
 */
export class UpdateStudentDto {

  // ─── Personal Information ────────────────────────────────────────────────────

  /** Updated full name of the student */
  @IsOptional()  // Field is not required in update requests
  @IsString()
  name?: string;

  /** Updated email address */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** Updated date of birth in ISO 8601 format (YYYY-MM-DD) */
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // ─── Address Information ─────────────────────────────────────────────────────

  /** Updated village or neighbourhood */
  @IsOptional()
  @IsString()
  village?: string;

  /** Updated administrative sector */
  @IsOptional()
  @IsString()
  sector?: string;

  /** Updated district */
  @IsOptional()
  @IsString()
  district?: string;

  /** Updated province */
  @IsOptional()
  @IsString()
  province?: string;

  /** Updated country */
  @IsOptional()
  @IsString()
  country?: string;

  // ─── Academic Information ────────────────────────────────────────────────────

  /** Updated department */
  @IsOptional()
  @IsString()
  department?: string;

  /** Updated education level */
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
