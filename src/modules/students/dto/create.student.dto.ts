/**
 * Data Transfer Object (DTO) for create.student.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

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
  @IsNotEmpty()  // Validation: field must be provided and non-empty
  @IsString()    // Validation: must be a string value
  name: string;

  /**
   * University or personal email address of the student.
   * Required — must be a valid email format.
   */
  @IsNotEmpty()  // Validation: must be provided
  @IsEmail()     // Validation: must be a valid email format (e.g. user@domain.com)
  email: string;

  /**
   * Password for the student's user account.
   * Optional — if not provided, a default password will be assigned.
   */
  /**
   * Hashed security password credentials.
   */
  @IsOptional()
  @IsString()
  password?: string;

  /**
   * Date of birth in ISO 8601 format (YYYY-MM-DD).
   * Optional — used to verify student age and for record keeping.
   */
  @IsOptional()       // Validation: field can be omitted entirely
  @IsDateString()     // Validation: if provided, must be a valid ISO date string
  dateOfBirth?: string;

  // ─── Address Information ─────────────────────────────────────────────────────

  /**
   * Village or neighbourhood where the student currently lives.
   * Optional — e.g. "Kimironko", "Kacyiru".
   */
  /**
   * Associated property field: village.
   */
  @IsOptional()
  @IsString()
  village?: string;

  /**
   * Administrative sector of the student's address.
   * Optional — e.g. "Kimironko Sector".
   */
  /**
   * Associated property field: sector.
   */
  @IsOptional()
  @IsString()
  sector?: string;

  /**
   * District of the student's address.
   * Optional — e.g. "Gasabo", "Kicukiro", "Nyarugenge".
   */
  /**
   * Associated property field: district.
   */
  @IsOptional()
  @IsString()
  district?: string;

  /**
   * Province of the student's address.
   * Optional — e.g. "Kigali City", "Northern Province", "Southern Province".
   */
  /**
   * Associated property field: province.
   */
  @IsOptional()
  @IsString()
  province?: string;

  /**
   * Country of residence.
   * Optional — defaults to "Rwanda" in most cases.
   */
  /**
   * Associated property field: country.
   */
  @IsOptional()
  @IsString()
  country?: string;

  // ─── Academic Information ────────────────────────────────────────────────────

  /**
   * Department the student is enrolling in.
   * Optional — e.g. "Computer Science", "Business Administration", "Engineering".
   */
  /**
   * Associated department profile relation.
   */
  @IsOptional()
  @IsString()
  department?: string;

  /**
   * Highest education level the student attained before joining the university.
   * Optional — e.g. "O-Level", "A-Level", "Diploma".
   */
  /**
   * Associated property field: educationLevel.
   */
  @IsOptional()
  @IsString()
  educationLevel?: string;

  /**
   * Associated property field: program.
   */
  @IsOptional()
  @IsString()
  program?: string;

  /**
   * Associated property field: phoneNumber.
   */
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
