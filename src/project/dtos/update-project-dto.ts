import { IsString, Length } from 'class-validator';

export class UpdateProjectNameDto {
  @IsString()
  id: string;

  @IsString()
  @Length(2, 50)
  name: string;
}

export class UpdateProjectApiKey {
  @IsString()
  id: string;
}
