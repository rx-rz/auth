import { AuthMethod } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsString } from 'class-validator';

// export enum AuthMethod {
//   GOOGLE_OAUTH,
//   GITHUB_OAUTH,
//   FACEBOOK_OAUTH,
//   EMAIL_AND_PASSWORD_SIGNIN,
//   MAGICLINK,
// }

export class StoreRefreshTokenDto {
  @IsString()
  token: string;

  @IsDateString()
  expiresAt: Date;

  @IsString()
  adminId: string;

  @IsEnum(AuthMethod)
  authMethod: AuthMethod;
}
