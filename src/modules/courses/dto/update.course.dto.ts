import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  lecturerId?: number;

  @IsOptional()
  @IsString()
  timetable?: string;
}
