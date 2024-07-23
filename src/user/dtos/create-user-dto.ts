import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsString()
  projectId: string;

  @IsString()
  @Length(6, 255)
  firstName: string;

  @IsString()
  @Length(6, 255)
  lastName: string;
}
