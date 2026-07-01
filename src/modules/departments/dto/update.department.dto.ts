/**
 * Data Transfer Object (DTO) for update.department.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;
}
