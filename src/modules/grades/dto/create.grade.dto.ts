import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGradeDto {
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  @IsNotEmpty()
  @IsNumber()
  grade: number;
}
