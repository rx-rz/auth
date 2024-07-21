import { IsString } from 'class-validator';

export class RemoveUserFromProjectDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
