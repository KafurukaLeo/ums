/**
 * Data Transfer Object (DTO) for create-fee-structure.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNotEmpty, IsNumber, IsString, IsInt, Min } from 'class-validator';

/**
 * DTO (Data Transfer Object) for creating a new fee structure configuration.
 * Validates program, year, semester, and total amount.
 */
export class CreateFeeStructureDto {
  /**
   * Associated property field: program.
   */
  @IsNotEmpty()
  @IsString()
  program: string;

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

  /**
   * Associated property field: totalAmount.
   */
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;
}
