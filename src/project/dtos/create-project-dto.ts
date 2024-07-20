import { IsString, Length } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  adminId: string;
}
