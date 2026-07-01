import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @IsNotEmpty()
  @IsInt()
  courseId: number;
}
