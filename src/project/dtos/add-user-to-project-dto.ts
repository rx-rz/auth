import { IsString } from 'class-validator';

export class AddUserToProjectDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
