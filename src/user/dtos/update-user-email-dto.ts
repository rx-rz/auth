import { IsEmail, IsString } from 'class-validator';
import { UserIDProjectIDDto } from './user-id-project-id-dto';

export class UpdateUserEmailDto  {
  @IsEmail()
  currentEmail: string;

  @IsEmail()
  newEmail: string;

  @IsString()
  password: string;

  @IsString()
  projectId: string;
}
