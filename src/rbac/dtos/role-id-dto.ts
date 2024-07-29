import { IsNumber } from 'class-validator';

export class RoleIdDto {
  @IsNumber()
  roleId: number;
}
