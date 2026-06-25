import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * CreateStudentDto — validates and documents the payload for student registration.
 *
 * When a student registers their profile in the system they must provide:
 *  - Personal details:  full name, email, date of birth
 *  - Address details:   village, sector, district, province, country
 *  - Academic details:  department, education level
 *
 * Note: Password is handled separately via the /auth/register endpoint.
 * This DTO is used for creating the student's university profile after auth registration.
 */
export class CreateStudentDto {

  // ─── Personal Information ────────────────────────────────────────────────────

  /**
   * Full name of the student (first name + last name, e.g. "John Mugisha Doe").
   * Required — must not be empty.
   */
  @ApiProperty({ description: 'Full name of the student', example: 'John Mugisha Doe' })
  @IsNotEmpty()  // Validation: field must be provided and non-empty
  @IsString()    // Validation: must be a string value
  name: string;

  /**
   * University or personal email address of the student.
   * Required — must be a valid email format.
   */
  @ApiProperty({ description: 'Email address of the student', example: 'john.doe@university.ac.rw' })
  @IsNotEmpty()  // Validation: must be provided
  @IsEmail()     // Validation: must be a valid email format (e.g. user@domain.com)
  email: string;

  /**
   * Password for the student's user account.
   * Optional — if not provided, a default password will be assigned.
   */
  @ApiPropertyOptional({ description: 'Password for the student user account', example: 'password123' })
  @IsOptional()
  @IsString()
  password?: string;

  /**
   * Date of birth in ISO 8601 format (YYYY-MM-DD).
   * Optional — used to verify student age and for record keeping.
   */
  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)', example: '2000-03-15' })
  @IsOptional()       // Validation: field can be omitted entirely
  @IsDateString()     // Validation: if provided, must be a valid ISO date string
  dateOfBirth?: string;

  // ─── Address Information ─────────────────────────────────────────────────────

  /**
   * Village or neighbourhood where the student currently lives.
   * Optional — e.g. "Kimironko", "Kacyiru".
   */
  @ApiPropertyOptional({ description: 'Village or neighbourhood', example: 'Kimironko' })
  @IsOptional()
  @IsString()
  village?: string;

  /**
   * Administrative sector of the student's address.
   * Optional — e.g. "Kimironko Sector".
   */
  @ApiPropertyOptional({ description: 'Administrative sector', example: 'Kimironko' })
  @IsOptional()
  @IsString()
  sector?: string;

  /**
   * District of the student's address.
   * Optional — e.g. "Gasabo", "Kicukiro", "Nyarugenge".
   */
  @ApiPropertyOptional({ description: 'District', example: 'Gasabo' })
  @IsOptional()
  @IsString()
  district?: string;

  /**
   * Province of the student's address.
   * Optional — e.g. "Kigali City", "Northern Province", "Southern Province".
   */
  @ApiPropertyOptional({ description: 'Province', example: 'Kigali City' })
  @IsOptional()
  @IsString()
  province?: string;

  /**
   * Country of residence.
   * Optional — defaults to "Rwanda" in most cases.
   */
  @ApiPropertyOptional({ description: 'Country of residence', example: 'Rwanda' })
  @IsOptional()
  @IsString()
  country?: string;

  // ─── Academic Information ────────────────────────────────────────────────────

  /**
   * Department the student is enrolling in.
   * Optional — e.g. "Computer Science", "Business Administration", "Engineering".
   */
  @ApiPropertyOptional({ description: 'Department the student belongs to', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  /**
   * Highest education level the student attained before joining the university.
   * Optional — e.g. "O-Level", "A-Level", "Diploma".
   */
  @ApiPropertyOptional({
    description: "Highest education level before joining university",
    example: 'A-Level',
    enum: ['O-Level', 'A-Level', 'Diploma', "Bachelor's Degree", 'Other'],
  })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiPropertyOptional({ description: 'Degree program of the student', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ description: 'Phone number of the student', example: '+250788123456' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
