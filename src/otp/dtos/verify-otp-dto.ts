import { IsEmail, IsNumber, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNumber()
  @Length(6, 6)
  code: number;

  @IsEmail()
  email: string;
}
