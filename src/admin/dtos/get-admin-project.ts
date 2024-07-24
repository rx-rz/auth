import { IsNotEmpty, IsString, Length } from "class-validator";

export class GetAdminProjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  adminId: string;

  @IsString()
  @Length(1,100)
  name: string;
}