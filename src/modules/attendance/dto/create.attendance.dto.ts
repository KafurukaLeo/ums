import { IsDateString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
