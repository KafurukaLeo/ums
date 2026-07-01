import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
