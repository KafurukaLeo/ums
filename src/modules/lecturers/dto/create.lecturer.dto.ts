import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLecturerDto {
  @ApiProperty({ description: 'The name of the lecturer', example: 'Dr. Jane Smith' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the lecturer', example: 'jane.smith@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
