import { IsString } from 'class-validator';

export class VerifyProjectIdDto {
  @IsString()
  projectId: string;

  @IsString()
  apiKey: string;
}
