import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class CreateOtpDto {
  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean;
}
