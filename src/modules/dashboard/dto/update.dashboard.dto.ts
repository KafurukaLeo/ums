/**
 * Data Transfer Object (DTO) for update.dashboard.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsOptional, IsString } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;
}
