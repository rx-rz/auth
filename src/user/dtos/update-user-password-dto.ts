import { IsEmail, IsString } from 'class-validator';
import { UserIDProjectIDDto } from './user-id-project-id-dto';

export class UpdateUserPasswordDto extends UserIDProjectIDDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;

  @IsEmail()
  email: string;
}
