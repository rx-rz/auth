import { IsNumber, IsString } from 'class-validator';

export class AssignUserProjectRole {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;

  @IsNumber()
  roleId: string;
}
