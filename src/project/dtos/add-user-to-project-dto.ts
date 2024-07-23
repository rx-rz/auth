import { IsString } from 'class-validator';

export class AddUserToProjectDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password?: string;
}
