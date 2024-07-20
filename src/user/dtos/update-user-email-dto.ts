import { IsEmail, IsString } from 'class-validator';

export class UpdateUserEmailDto {
  @IsEmail()
  currentEmail: string;

  @IsEmail()
  newEmail: string;

  @IsString()
  password: string;
}
