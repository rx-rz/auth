import { IsString } from 'class-validator';

export class IDDto {
  @IsString()
  projectId: string;
}
