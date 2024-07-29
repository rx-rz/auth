import { AuthMethod } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class StoreRefreshTokenDto {
  @IsString()
  token: string;

  @IsDateString()
  expiresAt: Date;

  @IsString()
  @IsOptional()
  adminId: string;

  @IsString()
  @IsOptional()
  userId: string;

  @IsEnum(AuthMethod)
  authMethod: AuthMethod;
}
