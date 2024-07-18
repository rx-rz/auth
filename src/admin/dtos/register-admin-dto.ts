import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterAdminDTO {
  @Length(5, 255, { message: 'Email length cannot be less than 5 characters' })
  @IsEmail()
  email: string;

  @Length(6, 255, {
    message: 'Password length cannot be less than 6 characters',
  })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'Password must contain at least one letter, one number, and one special character',
  })
  password: string;

  @IsString()
  @Length(1, 255, {
    message: 'First name length cannot be less than 1 characters',
  })
  firstName: string;

  @IsString()
  @Length(1, 255, {
    message: 'Last name length cannot be less than 1 characters',
  })
  lastName: string;
}