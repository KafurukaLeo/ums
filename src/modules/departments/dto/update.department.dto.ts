/**
 * Data Transfer Object (DTO) for update.department.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsOptional()
  @IsString()
  name?: string;
}
