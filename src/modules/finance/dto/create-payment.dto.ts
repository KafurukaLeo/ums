/**
 * Data Transfer Object (DTO) for create-payment.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

/**
 * DTO (Data Transfer Object) for posting a tuition payment.
 * Validates student, payment amount, year, and semester.
 */
export class CreatePaymentDto {
  /**
   * Foreign key link identifying the associated Student profile.
   */
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01) // Payment must be greater than zero
  amountPaid: number;

  /**
   * Applicable academic year (e.g. 2026).
   */
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  academicYear: number;

  /**
   * Applicable academic semester index (e.g. 1, 2).
   */
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semester: number;
}
