import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDashboardDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
