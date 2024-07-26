import { IsEmail, IsString } from 'class-validator';

export class LoginWithEmailAndPasswordDto {
  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  projectId: string;
}
