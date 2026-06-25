import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({ description: 'The name of the dashboard metric/element', example: 'System Status Overview' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
