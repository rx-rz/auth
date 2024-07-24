import { IsNotEmpty, IsString } from "class-validator";

export class AdminIdDto {
  @IsString()
  @IsNotEmpty()
  adminId: string;
}
