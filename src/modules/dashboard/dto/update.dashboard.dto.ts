import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDashboardDto {
  @ApiPropertyOptional({ description: 'The name of the dashboard metric/element', example: 'System Status Overview' })
  @IsOptional()
  @IsString()
  name?: string;
}
