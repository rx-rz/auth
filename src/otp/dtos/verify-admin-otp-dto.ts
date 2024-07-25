import { IsBoolean, IsEmail, IsOptional, IsString, Length } from "class-validator";

export class VerifyAdminOtpDto {
  @IsString()
  @Length(6, 6)
  code: string;

  @IsEmail()
  @Length(2, 255, {
    message: 'Email length cannot be more than 255 characters',
  })
  email: string;

}
