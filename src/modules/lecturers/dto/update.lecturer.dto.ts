import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateLecturerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
