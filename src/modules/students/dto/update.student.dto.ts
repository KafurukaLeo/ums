import { IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({ description: 'Updated full name', example: 'John Mugisha Doe' })
  @IsOptional()  // Field is not required in update requests
  @IsString()
  name?: string;

  /** Updated email address */
  @ApiPropertyOptional({ description: 'Updated email address', example: 'john.doe@university.ac.rw' })
  @IsOptional()
  @IsEmail()
  email?: string;

  /** Updated date of birth in ISO 8601 format (YYYY-MM-DD) */
  @ApiPropertyOptional({ description: 'Updated date of birth (YYYY-MM-DD)', example: '2000-03-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // ─── Address Information ─────────────────────────────────────────────────────

  /** Updated village or neighbourhood */
  @ApiPropertyOptional({ description: 'Updated village', example: 'Kimironko' })
  @IsOptional()
  @IsString()
  village?: string;

  /** Updated administrative sector */
  @ApiPropertyOptional({ description: 'Updated sector', example: 'Kimironko' })
  @IsOptional()
  @IsString()
  sector?: string;

  /** Updated district */
  @ApiPropertyOptional({ description: 'Updated district', example: 'Gasabo' })
  @IsOptional()
  @IsString()
  district?: string;

  /** Updated province */
  @ApiPropertyOptional({ description: 'Updated province', example: 'Kigali City' })
  @IsOptional()
  @IsString()
  province?: string;

  /** Updated country */
  @ApiPropertyOptional({ description: 'Updated country', example: 'Rwanda' })
  @IsOptional()
  @IsString()
  country?: string;

  // ─── Academic Information ────────────────────────────────────────────────────

  /** Updated department */
  @ApiPropertyOptional({ description: 'Updated department', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  /** Updated education level */
  @ApiPropertyOptional({
    description: 'Updated education level',
    example: 'A-Level',
    enum: ['O-Level', 'A-Level', 'Diploma', "Bachelor's Degree", 'Other'],
  })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiPropertyOptional({ description: 'Updated degree program', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ description: 'Updated phone number', example: '+250788123456' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
