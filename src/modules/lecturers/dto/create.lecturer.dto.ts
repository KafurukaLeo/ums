import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateLecturerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
