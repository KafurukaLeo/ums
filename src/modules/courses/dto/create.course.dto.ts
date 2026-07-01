import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsInt()
  lecturerId?: number;

  @IsOptional()
  @IsString()
  timetable?: string;
}
