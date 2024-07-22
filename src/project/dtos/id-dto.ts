import { IsString } from 'class-validator';

export class IDDto {
  @IsString()
  id: string;
}
