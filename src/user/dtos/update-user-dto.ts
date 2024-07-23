import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { UserIDProjectIDDto } from './user-id-project-id-dto';

export class UpdateUserDto extends UserIDProjectIDDto {
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

  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
