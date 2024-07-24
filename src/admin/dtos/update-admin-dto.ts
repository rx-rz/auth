import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateAdminDTO {
  @IsEmail()
  @Length(2, 255, {
    message: 'Email length cannot be more than 255 characters',
  })
  email: string;

  @IsString()
  @Length(1, 255, {
    message: 'First name length cannot be more than 255 characters',
  })
  @IsOptional()
  firstName?: string;

  @IsString()
  @Length(1, 255, {
    message: 'Last name length cannot be more than 255 characters',
  })
  @IsOptional()
  lastName?: string;

  @IsBoolean({ message: 'Is Verified should be a boolean' })
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean({ message: 'MFA Enabled should be a boolean' })
  @IsOptional()
  mfaEnabled?: boolean;
}
