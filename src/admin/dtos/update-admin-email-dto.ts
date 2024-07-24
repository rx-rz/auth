import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class UpdateAdminEmailDto {
  @IsEmail()
  @Length(2, 255, {
    message: 'Email length cannot be more than 255 characters',
  })
  currentEmail: string;

  @IsEmail()
  @Length(2, 255, {
    message: 'Email length cannot be more than 255 characters',
  })
  newEmail: string;

  @Length(6, 100, {
    message:
      'Password length cannot be less than 6 characters or more than 100.',
  })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'Password must contain at least one letter, one number, and one special character',
  })
  password: string;
}
