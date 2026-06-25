import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO (Data Transfer Object) for posting a tuition payment.
 * Validates student, payment amount, year, and semester.
 */
export class CreatePaymentDto {
  @ApiProperty({ description: 'The ID of the student making the payment', example: 1 })
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @ApiProperty({ description: 'The amount of tuition fee to pay', example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01) // Payment must be greater than zero
  amountPaid: number;

  @ApiProperty({ description: 'The academic year this payment applies to', example: 2026 })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  academicYear: number;

  @ApiProperty({ description: 'The semester this payment applies to', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semester: number;
}
