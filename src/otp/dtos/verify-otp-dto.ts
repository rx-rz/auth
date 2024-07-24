import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(6, 6)
  code: string;

  @IsEmail()
  @Length(2, 255, {
    message: 'Email length cannot be more than 255 characters',
  })
  email: string;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;
}
