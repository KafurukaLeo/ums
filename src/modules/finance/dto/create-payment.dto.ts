import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

/**
 * DTO (Data Transfer Object) for posting a tuition payment.
 * Validates student, payment amount, year, and semester.
 */
export class CreatePaymentDto {
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01) // Payment must be greater than zero
  amountPaid: number;

  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  academicYear: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semester: number;
}
