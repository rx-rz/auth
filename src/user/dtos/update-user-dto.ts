import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @Length(6, 255)
  @IsString()
  firstName: string;

  @IsOptional()
  @Length(6, 255)
  @IsString()
  lastName: string;

  @IsOptional()
  @IsBoolean()
  isVerified: boolean;
}
