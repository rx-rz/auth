import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(6, 6)
  code: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;
}
