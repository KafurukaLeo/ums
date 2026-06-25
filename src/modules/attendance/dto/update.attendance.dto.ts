import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ description: 'The ID of the enrollment', example: 1 })
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  @ApiPropertyOptional({ description: 'The date of attendance (ISO 8601 string)', example: '2026-06-18T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'The attendance status', enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
