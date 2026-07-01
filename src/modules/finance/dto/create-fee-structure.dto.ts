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
  @IsNotEmpty()
  @IsString()
  program: string;

  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  academicYear: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semester: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;
}
