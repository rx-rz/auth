import { IsBoolean, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateOtpDto {
  @IsEmail()
  @Length(2, 255, {
    message: 'Email length cannot be more than 255 characters',
  })
  email: string;

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean;
}
