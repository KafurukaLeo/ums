import { IsNotEmpty, IsNumber, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO (Data Transfer Object) for creating a new fee structure configuration.
 * Validates program, year, semester, and total amount.
 */
export class CreateFeeStructureDto {
  @ApiProperty({ description: 'The degree program (e.g. Computer Science)', example: 'Computer Science' })
  @IsNotEmpty()
  @IsString()
  program: string;

  @ApiProperty({ description: 'The academic year', example: 2026 })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  academicYear: number;

  @ApiProperty({ description: 'The semester of the academic year', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semester: number;

  @ApiProperty({ description: 'The total fee amount required for the semester', example: 1500.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;
}
