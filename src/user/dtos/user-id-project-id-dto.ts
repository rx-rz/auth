import { IsString } from 'class-validator';

export class UserIDProjectIDDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
