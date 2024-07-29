import { IsNumber, IsString } from 'class-validator';

export class UpdateRoleNameDto {
  @IsNumber()
  roleId: number;

  @IsString()
  newName: string;
}
