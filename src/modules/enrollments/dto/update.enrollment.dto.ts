import { IsInt, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  courseId?: number;
}
