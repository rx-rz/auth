import { IsEmail, IsString, Length, Matches, Min } from 'class-validator';

export class LoginAdminDto {
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
}
