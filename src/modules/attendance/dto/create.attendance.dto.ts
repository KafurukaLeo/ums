import { IsDateString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'The ID of the enrollment', example: 1 })
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  @ApiProperty({ description: 'The date of attendance (ISO 8601 string)', example: '2026-06-18T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'The attendance status', enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
