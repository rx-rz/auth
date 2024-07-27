import { AuthMethod, LoginStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLoginInstanceDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsEnum(AuthMethod)
  authMethod: AuthMethod;

  @IsEnum(LoginStatus)
  status: LoginStatus;

  @IsOptional()
  @IsString()
  failureReason?: string;
}
