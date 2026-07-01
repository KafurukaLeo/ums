/**
 * Data Transfer Object (DTO) for create.department.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  /**
   * Full display name of the user or profile record.
   */
  @IsNotEmpty()
  @IsString()
  name: string;
}
