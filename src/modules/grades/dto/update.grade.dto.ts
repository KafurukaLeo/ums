import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateGradeDto {
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  @IsOptional()
  @IsNumber()
  grade?: number;
}
