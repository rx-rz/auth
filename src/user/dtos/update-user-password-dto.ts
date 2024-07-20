import { IsEmail, IsString } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;

  @IsEmail()
  email: string;
}
