import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterWithEmailAndPasswordDto {
  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsString()
  @Length(2, 100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsString()
  projectId: string;
}
