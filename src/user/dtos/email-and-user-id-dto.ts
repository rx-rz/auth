import { IsEmail, IsString } from 'class-validator';

export class EmailAndUserIDDto {
  @IsString()
  userId: string;

  @IsEmail()
  email: string;
}
