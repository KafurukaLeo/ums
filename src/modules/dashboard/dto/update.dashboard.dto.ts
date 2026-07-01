import { IsOptional, IsString } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;
}
